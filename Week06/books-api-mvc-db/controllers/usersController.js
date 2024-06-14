const User = require("../models/user");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving users");
  }
};

const getUserById = async (req, res) => {
  const userId = parseInt(req.params.id);
  try {
    const user = await User.getUserById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving user");
  }
};

const createUser = async (req, res) => {
    const newUser = req.body;
    try {
      const createdUser = await User.createUser(newUser);
      res.status(201).json(createdUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error creating User");
    }
};

const updateUser = async (req, res) => {
    const userId = parseInt(req.params.id);
    const newUserData = req.body;
  
    try {
      const updatedUser = await User.updateUser(userId, newUserData);
      if (!updatedUser) {
        return res.status(404).send("User not found");
      }
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error updating user");
    }
  };
  
  const deleteUser = async (req, res) => {
    const userId = parseInt(req.params.id);
  
    try {
      const success = await User.deleteUser(userId);
      if (!success) {
        return res.status(404).send("User not found");
      }
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).send("Error deleting user");
    }
  };

  const searchUsers = async(req, res) => {
    const searchTerm = req.query.searchTerm;

    try{
        const users = await User.searchUser(searchTerm);
        res.json(users);
    }
    catch(error){
        console.error(error);
        res.status(500).json({message: "Error searching users"});
    }
}

const getUsersWithBooks = async(req, res) => {
    try {
      const users = await User.getUsersWithBooks();
      res.json(users);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching users with books" });
    }
  }

  const addBooksToUser = async (req, res) => {
    const newBookData = req.body;
    try {
        const users = await User.addBooksToUser(newBookData);
        if (!users) {
            return res.status(400).send('Could not add book to user');
        }
        res.status(201).json(users);
    } catch(error) {
        console.error(error);
        res.status(500).send('error in server could not add book to user');
    }
};

const removeBookFromUser = async (req, res) => {
    const newBookData = req.body;
    const bookId = parseInt(req.params.bookId);
    try {
        const users = await User.removeBookFromUser(bookId,newBookData);
        if (!users) {
            return res.status(404).send('Could not remove book to user');
        }
        res.status(200).json(users);
    } catch(error) {
        console.error(error);
        res.status(500).send('error in server could not remove book to user');
    }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  searchUsers,
  getUsersWithBooks,
  addBooksToUser,
  removeBookFromUser,
};