const sql = require("mssql");
const dbConfig = require("../dbConfig");

class User {
  constructor(id, username, email) {
    this.id = id;
    this.username = username;
    this.email = email;
  }

  static async getAllUsers() {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `SELECT * FROM Users`; // Replace with your actual table name

    const request = connection.request();
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset.map(
      (row) => new User(row.id, row.username, row.email)
    ); // Convert rows to user objects
  }

  static async getUserById(id) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `SELECT * FROM Users WHERE id = @id`; // Parameterized query

    const request = connection.request();
    request.input("id", id);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.recordset[0]
      ? new User(
          result.recordset[0].id,
          result.recordset[0].username,
          result.recordset[0].email
        )
      : null; // Handle user not found
  }

  static async createUser(newUserData) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `INSERT INTO Users (username, email) VALUES (@username, @email); SELECT SCOPE_IDENTITY() AS id;`; // Retrieve ID of inserted record

    const request = connection.request();
    request.input("username", newUserData.username);
    request.input("email", newUserData.email);

    const result = await request.query(sqlQuery);

    connection.close();

    // Retrieve the newly created book using its ID
    return this.getUserById(result.recordset[0].id);
  }

  static async updateUser(id, newUserData) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `UPDATE Users SET username = @username, email = @email WHERE id = @id`; // Parameterized query

    const request = connection.request();
    request.input("id", id);
    request.input("username", newUserData.username || null); // Handle optional fields
    request.input("email", newUserData.email || null);

    await request.query(sqlQuery);

    connection.close();

    return this.getUserById(id); // returning the updated book data
  }

  static async deleteUser(id) {
    const connection = await sql.connect(dbConfig);

    const sqlQuery = `DELETE FROM Users WHERE id = @id`; // Parameterized query

    const request = connection.request();
    request.input("id", id);
    const result = await request.query(sqlQuery);

    connection.close();

    return result.rowsAffected > 0; // Indicate success based on affected rows
  }

  static async searchUser(searchTerm){
    const connection = await sql.connect(dbConfig);
    try{
        const query = `SELECT * FROM Users WHERE username LIKE '%${searchTerm}%' OR email LIKE '%${searchTerm}%'`

        const request = connection.request();
        const result = await request.query(query);
        return result.recordset;
    }
    catch(error){
        console.error(error);
        throw new Error("Error searching users"); // or handle error differently
    }finally{
        await connection.close(); // close connection even on errors
    }
  }

  static async getUsersWithBooks() {
    const connection = await sql.connect(dbConfig);

    try {
      const query = `
        SELECT u.id AS user_id, u.username, u.email, b.id AS book_id, b.title, b.author
        FROM Users u
        LEFT JOIN UserBooks ub ON ub.user_id = u.id
        LEFT JOIN Books b ON ub.book_id = b.id
        ORDER BY u.username;
      `;

      const result = await connection.request().query(query);

      // Group users and their books
      const usersWithBooks = {};
      for (const row of result.recordset) {
        const userId = row.user_id;
        if (!usersWithBooks[userId]) {
          usersWithBooks[userId] = {
            id: userId,
            username: row.username,
            email: row.email,
            books: [],
          };
        }
        usersWithBooks[userId].books.push({
          id: row.book_id,
          title: row.title,
          author: row.author,
        });
      }

      return Object.values(usersWithBooks);
    } catch (error) {
      throw new Error("Error fetching users with books");
    } finally {
      await connection.close();
    }
  }

  static async addBooksToUser(newBookData) {
    const connection = await sql.connect(dbConfig);

    try{
      const sqlQuery = `
      INSERT INTO UserBooks(user_id, book_id)
      VALUES
      (@user_id, @book_id);
      SELECT SCOPE_IDENTITY() AS id
      `;

      const request = connection.request();
      request.input('user_id', newBookData.user_id);
      request.input('book_id', newBookData.book_id);
      const result = await request.query(sqlQuery);
      
      return await this.getUsersWithBooks();
    }catch (error) {
      throw new Error("Could not add books to users");
    } finally {
      await connection.close();
    }
  }

  static async removeBookFromUser(bookId, newUserData) {
    const connection = await sql.connect(dbConfig);
    try {
        const connection = await sql.connect(dbConfig);
        const sqlQuery = `DELETE FROM UserBooks WHERE 
        user_id=@user_id
        AND 
        book_id=@book_id 
        `;
        const request = connection.request();
        request.input('user_id', newUserData.user_id);
        request.input('book_id', bookId);
        const result = await request.query(sqlQuery);
        if (result.rowsAffected[0] === 0) {
            return null;
        }
        return await this.getUsersWithBooks();
    } catch (error) {
        throw new Error("could not remove book from user");
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}
  
}

module.exports = User;