const Joi = require("joi");

const validateUser = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().email({ tlds: { allow: false } }).required(),
    /*
    password: Joi.string()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})'))
        .required()
        .messages({
        'string.pattern.base': 'password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
        }),
        
    dateOfBirth: Joi.date().less('now').greater('1-1-1900').required(),
    
    contactNumber: Joi.string().pattern(new RegExp('^[0-9]{10,15}$')).required()
      .messages({
        'string.pattern.base': 'contactNumber must be a string of 10 to 15 digits',
      }),

    income: Joi.number().positive().required().messages({
      'number.base': 'income must be a number',
      'number.positive': 'income must be a positive number',
    }),
    */

  });

  const validation = schema.validate(req.body, { abortEarly: false }); // Validate request body

  if (validation.error) {
    const errors = validation.error.details.map((error) => error.message);
    res.status(400).json({ message: "Validation error", errors });
    return; // Terminate middleware execution on validation error
  }

  next(); // If validation passes, proceed to the next route handler
};

module.exports = validateUser;