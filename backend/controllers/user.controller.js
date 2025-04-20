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

export const UpdateUser = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { name, phone, address, profilePicture } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;
    if (profilePicture) updateData.profilePicture = profilePicture;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      updateData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }
    console.log(updatedUser,"user updated")

    res.status(200).json({
      message: 'User updated successfully.',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        profilePicture: updatedUser.profilePicture
      }
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const GetUserProfile = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'User profile retrieved successfully.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        height: user.height,
        weight: user.weight,
        address: user.address || {
          street: '',
          city: '',
          state: '',
          zipCode: ''
        },
        profilePicture: user.profilePicture || '',
        medicalHistory: user.medicalHistory || {
          allergies: [],
          currentMedications: [],
          pastSurgeries: [],
          chronicConditions: []
        },
        lifestyle: user.lifestyle || {
          smoking: 'Never',
          alcohol: 'Never',
          exercise: 'None',
          sleepHours: 8
        },
        emergencyContact: user.emergencyContact || {
          name: '',
          relationship: '',
          phone: ''
        },
        verified: user.verified,
        role: user.role,
        sessions: user.sessions || []
      }
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateMedicalHistory = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { allergies, currentMedications, pastSurgeries, chronicConditions } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        medicalHistory: {
          allergies: allergies || [],
          currentMedications: currentMedications || [],
          pastSurgeries: pastSurgeries || [],
          chronicConditions: chronicConditions || []
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Medical history updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateLifestyle = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { smoking, alcohol, exercise, sleepHours } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        lifestyle: {
          smoking: smoking || 'Never',
          alcohol: alcohol || 'Never',
          exercise: exercise || 'None',
          sleepHours: sleepHours || 8
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Lifestyle information updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateEmergencyContact = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { name, relationship, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        emergencyContact: {
          name: name || '',
          relationship: relationship || '',
          phone: phone || ''
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Emergency contact updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const UpdateBasicInfo = async (req, res) => {
  try {
    const authToken = req.cookies['auth_token'];

    if (!authToken) {
      return res.status(401).json({ message: 'No token provided. Unauthorized.' });
    }

    const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
    const { name, phone, dateOfBirth, gender, bloodGroup, height, weight } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      {
        name,
        phone,
        dateOfBirth,
        gender,
        bloodGroup,
        height,
        weight
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Basic information updated successfully.',
      user: updatedUser
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token.' });
    }
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
