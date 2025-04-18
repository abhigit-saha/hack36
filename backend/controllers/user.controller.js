import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const GetUser = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];
    // console.log(authToken);

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    jwt.verify(authToken, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
      }

      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }

      res.status(200).json({
        message: 'User details retrieved successfully.',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
