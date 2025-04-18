import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

const protectRoute = async (req, res, next) => {
  try {
    const authToken = req.cookies['auth_token'];

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

      req.user = {
        id: user._id,
        email: user.email
      };

      next(); 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export default protectRoute;
