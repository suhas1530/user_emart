const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const upload = require("../config/upload");
const MemberRequest = require("../models/MemberRequest");
const { Member } = require("../models/authModel");

// Submit request (ONLY ONCE)
router.post("/apply", upload.single("proof"), async (req, res) => {
  try {
    const exists = await MemberRequest.findOne({ userId: req.body.userId });
    if (exists) return res.status(400).json({ message: "Already submitted" });

    const data = new MemberRequest({
      ...req.body,
      proofFile: req.file?.path,
    });
    await data.save();
    res.json({ message: "Member request submitted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// User status
router.get("/status/:userId", async (req, res) => {
  try {
    const data = await MemberRequest.findOne({ userId: req.params.userId });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin list
router.get("/admin/all", async (req, res) => {
  try {
    res.json(await MemberRequest.find());
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin add member directly
router.post("/admin/add", async (req, res) => {
  try {
    const memberId = `MEMBER${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    // Create member in Member collection
    const newMember = new Member({
      memberId,
      memberName: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      phone: req.body.phone || "",
      businessName: req.body.businessName || ""
    });
    await newMember.save();

    res.json({ message: "Member added successfully", memberId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin update - Approve/Reject requests
router.put("/admin/update/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const memberRequest = await MemberRequest.findById(req.params.id);
    
    if (!memberRequest) {
      return res.status(404).json({ message: "Request not found" });
    }

    let update = { status };

    if (status === "approved") {
      const randomNum = Math.floor(100 + Math.random() * 900);
      const memberEmail = `${memberRequest.name}${randomNum}@basavamart.com`;
      const memberPassword = `${randomNum}@basavamart.com`;
      const memberId = `MEMBER${Date.now()}${Math.floor(Math.random() * 1000)}`;

      // Hash the password for Member collection
      const hashedPassword = await bcrypt.hash(memberPassword, 10);

      // ✅ CREATE ACTUAL MEMBER DOCUMENT IN MEMBER COLLECTION
      const newMember = new Member({
        memberId,
        memberName: memberRequest.name,
        email: memberEmail,
        password: hashedPassword,
        phone: memberRequest.phone || "",
        businessName: memberRequest.businessName || ""
      });
      await newMember.save();

      // Update the MemberRequest with credentials (for admin reference)
      update.memberEmail = memberEmail;
      update.memberPassword = memberPassword; // Plain text for admin to share
    }

    await MemberRequest.findByIdAndUpdate(req.params.id, update);
    res.json({ 
      message: "Request updated successfully",
      ...(status === "approved" && { 
        credentials: {
          email: update.memberEmail,
          password: update.memberPassword
        }
      })
    });
  } catch (error) {
    console.error("Error updating member request:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;