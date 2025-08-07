const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get user's isTricity status (called before payment)
const getTricityStatus = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from auth middleware
    
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        isTricity: user.isTricity,
        message: user.isTricity 
          ? 'Service available in your area' 
          : 'Service not available in your area. Please contact us on WhatsApp for queries.',
        whatsappNumber: user.isTricity ? null : process.env.WHATSAPP_NUMBER
      }
    });
    
  } catch (error) {
    console.error('Error fetching tricity status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error in fetching tricity status',
      error: error.message
    });
  }
};

// Set user's isTricity status (called on login)
const setTricityStatus = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from auth middleware
    const { isTricity } = req.body; // Get isTricity from request body
    
    // Validate input
    if (typeof isTricity !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isTricity must be a boolean value (true or false)'
      });
    }
    
    // Update user's isTricity status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isTricity: isTricity },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        isTricity: true
      }
    });
    
    res.status(200).json({
      success: true,
      message: `Tricity status updated successfully`,
      data: {
        isTricity: updatedUser.isTricity,
        message: updatedUser.isTricity 
          ? 'Service available in your area' 
          : 'Service not available in your area',
        user: updatedUser
      }
    });
    
  } catch (error) {
    console.error('Error updating tricity status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getTricityStatus,
  setTricityStatus
};
