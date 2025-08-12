const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Helper function to get or create pincode
const getOrCreatePincode = async (pincodeValue) => {
  let pincode = await prisma.pincode.findUnique({
    where: { code: parseInt(pincodeValue) },
  });

  if (!pincode) {
    pincode = await prisma.pincode.create({
      data: {
        code: parseInt(pincodeValue),
        deliveryPrice: 100.0, // Default delivery price
      },
    });
  }

  return pincode;
};

// Add a new address for a user
exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { label, house, street, landmark, address1, city, pincode } =
      req.body;

    if (!house || !street || !city || !label || !pincode) {
      return res.status(400).json({
        message: "House, street, city, label, and pincode are required",
      });
    }

    const pincodeRecord = await getOrCreatePincode(pincode);

    const address = await prisma.address.create({
      data: {
        userId,
        pincodeId: pincodeRecord.id,
        label,
        house,
        street,
        landmark,
        address1,
        city,
      },
      include: { pincode: true },
    });

    res.status(201).json({
      message: "Address added",
      address: {
        ...address,
        deliveryPrice: address.pincode.deliveryPrice,
        pincodeValue: address.pincode.code,
      },
      deliveryPrice: address.pincode.deliveryPrice,
    });
  } catch (error) {
    console.error("Add address error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all addresses for a user
exports.getAddresses = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized: user not found" });
    }

    const addresses = await prisma.address.findMany({
      where: { userId },
      include: { pincode: true },
    });

    const transformedAddresses = addresses.map((address) => ({
      ...address,
      deliveryPrice: address.pincode.deliveryPrice,
      pincodeValue: address.pincode.code,
    }));

    res.json({ addresses: transformedAddresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update an address for a user
exports.updateAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { label, house, street, landmark, address1, city, pincode } =
      req.body;

    // Verify address ownership
    const address = await prisma.address.findUnique({
      where: { id: parseInt(id) },
      include: { pincode: true },
    });

    if (!address || address.userId !== userId) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Validate city
    const allowedCities = ["panchkula", "mohali", "chandigarh"];
    const cityNormalized = city?.toLowerCase();
    if (city && !allowedCities.includes(cityNormalized)) {
      return res.status(400).json({
        message: "City must be one of: panchkula, mohali, chandigarh",
      });
    }

    // Handle pincode update
    const pincodeRecord = pincode
      ? await getOrCreatePincode(pincode)
      : address.pincode;

    const updated = await prisma.address.update({
      where: { id: parseInt(id) },
      data: {
        pincodeId: pincodeRecord.id,
        label,
        house,
        street,
        landmark,
        address1,
        city: cityNormalized,
      },
      include: { pincode: true },
    });

    res.json({
      message: "Address updated",
      address: {
        ...updated,
        deliveryPrice: updated.pincode.deliveryPrice,
        pincodeValue: updated.pincode.code,
      },
      deliveryPrice: updated.pincode.deliveryPrice,
    });
  } catch (error) {
    console.error("Update address error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete an address for a user
exports.deleteAddress = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await prisma.address.findUnique({
      where: { id: parseInt(id) },
    });

    if (!address || address.userId !== userId) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Check if address is used in any order
    const orderExists = await prisma.order.findFirst({
      where: { addressId: parseInt(id) },
    });

    if (orderExists) {
      return res.status(400).json({
        message: "Cannot delete address used in an order",
      });
    }

    await prisma.address.delete({ where: { id: parseInt(id) } });
    res.json({ message: "Address deleted" });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get delivery price for a specific pincode
exports.getDeliveryPrice = async (req, res) => {
  try {
    const { pincode } = req.params;
    if (!pincode) {
      return res.status(400).json({ message: "Pincode is required" });
    }

    const pincodeRecord = await prisma.pincode.findUnique({
      where: { code: parseInt(pincode) },
    });

    res.json({
      pincode: parseInt(pincode),
      deliveryPrice: pincodeRecord?.deliveryPrice || 100.0,
      found: !!pincodeRecord,
    });
  } catch (error) {
    console.error("Get delivery price error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get delivery price for an address
exports.getAddressDeliveryPrice = async (req, res) => {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;

    const address = await prisma.address.findUnique({
      where: { id: parseInt(addressId) },
      include: { pincode: true },
    });

    if (!address || address.userId !== userId) {
      return res.status(404).json({ message: "Address not found" });
    }

    res.json({
      addressId: address.id,
      pincode: address.pincode.code,
      deliveryPrice: address.pincode.deliveryPrice,
    });
  } catch (error) {
    console.error("Get address delivery price error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Admin function to manage pincode delivery prices
exports.managePincodeDeliveryPrice = async (req, res) => {
  try {
    const { pincode, deliveryPrice } = req.body;

    if (!pincode || deliveryPrice === undefined) {
      return res.status(400).json({
        message: "Pincode and delivery price are required",
      });
    }

    const pincodeRecord = await prisma.pincode.upsert({
      where: { code: parseInt(pincode) },
      update: { deliveryPrice: parseFloat(deliveryPrice) },
      create: {
        code: parseInt(pincode),
        deliveryPrice: parseFloat(deliveryPrice),
      },
    });

    res.json({
      message: "Pincode delivery price updated successfully",
      pincode: pincodeRecord.code,
      deliveryPrice: pincodeRecord.deliveryPrice,
    });
  } catch (error) {
    console.error("Manage pincode delivery price error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all pincodes with delivery prices (Admin function)
exports.getAllPincodes = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 100);
    const skip = (pageNum - 1) * limitNum;

    const [pincodes, totalPincodes] = await Promise.all([
      prisma.pincode.findMany({
        orderBy: { code: "asc" },
        skip,
        take: limitNum,
      }),
      prisma.pincode.count(),
    ]);

    res.json({
      pincodes,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalPincodes / limitNum),
        totalPincodes,
        hasNextPage: pageNum < Math.ceil(totalPincodes / limitNum),
        hasPreviousPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error("Get all pincodes error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
