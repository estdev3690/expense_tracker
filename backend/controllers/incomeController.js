import incomeModel from "../models/incomeSchema.js";

const addIncome = async (req, res) => {
  const userId = req.user?.id;

  const { title, amount, income, category, description, date } = req.body;

  const parsedAmount = Number(amount);

  try {
    if (!title || !amount || !income || !category || !description || !date) {
      return res.status(400).json({ message: "All fields required" });
    }
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Amount must be positive integer" });
    }

    const newIncome = new incomeModel({
      userId,
      title,
      amount,
      category,
      description,
      date,
    });
    await newIncome.save();

    return res
      .status(200)
      .json({ success: true, message: "Income added", data: newIncome });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server Error" });
  }
};

const deleteIncome = async (req, res) => {
  const { id } = req.params;
  try {
    const deleteIncome = await incomeModel.findByIdAndDelete(id);
    if (!deleteIncome) {
      return res
        .status(404)
        .json({ success: false, message: "income not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "income deleted", deleteIncome });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server Error" });
  }
};

const updateIncome = async (req, res) => {
  const { id } = req.params;
  const { title, amount, income, category, description, date } = req.body;
  try {
    const incomeUpdate = await incomeModel.findById(id);
    if (!incomeUpdate) {
      return res
        .status(404)
        .json({ success: false, message: "income not found to update" });
    }

    incomeUpdate.title = title || incomeUpdate.title;
    incomeUpdate.amount = amount || incomeUpdate.amount;
    incomeUpdate.category = category || incomeUpdate.category;
    incomeUpdate.description = description || incomeUpdate.description;
    incomeUpdate.date = date || incomeUpdate.date;
   

    await incomeUpdate.save();

    return res
      .status(200)
      .json({ success: true, message: "income updated", data: incomeUpdate });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server Error" });
  }
};

const getIncome = async (req, res) => {
  try {
    const userId = req.user?.id;
    const getIncome = await incomeModel.find({ userId: userId });
    if (!getIncome) {
      return res
        .status(404)
        .json({ success: false, message: "income not found" });
    }
    return res.status(200).json({ success: true, data: getIncome });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server Error" });
  }
};

export { addIncome, deleteIncome, updateIncome ,getIncome};
