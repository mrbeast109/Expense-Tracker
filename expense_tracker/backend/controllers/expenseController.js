import expenseModel from "../models/Expense.js";
import getDateRange from "../utils/dataFilter.js";
import XLSX from "xlsx";

export async function addExpense(req, res) {
    const userId = req.user._id;
    const { description, amount, category, date } = req.body;

    try {
        if (!description || !amount || !category || !date) {
            return res.status(400).json({
                success: false,
                message: "Saare fields bharo!"
            })
        }

        const newExpense = new expenseModel({
            userId,
            description,
            amount,
            category,
            date
        })

        await newExpense.save();
        res.status(201).json({
            success: true,
            message: "Expense add kar di!",
            data: newExpense
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

export async function getAllExpense(req, res) {
    const userId = req.user._id;

    try {
        const expense = await expenseModel.find({ userId }).sort({ date: -1 });
        res.json({ sucess: true, expense });
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: "Server bura maan gaya"
        })
    }
}

export async function updateExpense(req, res) {
    const { id } = req.params;
    const userId = req.user._id;
    const { description, amount } = req.body;

    try {
        const updatedExpense = await expenseModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount },
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({
                success: false,
                message: "Expense nhi mila"
            })
        }

        res.json({ success: true, message: "Expense update kardiya hai", data: updatedIncome });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server bura maan gaya"
        })
    }
}

export async function deleteExpense(req, res) {
    const userId = req.params.id;

    try {
        const expense = await expenseModel.findByIdAndDelete(userId);
        if (!expense) {
            return res.status(404).json({
                success: false,
                message: "Expense hai bhi?"
            })
        }

        return res.json({
            success: true,
            message: "Expense delete ho gaya"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server bura maan gaya"
        })
    }
}


export async function downloadExpense(req, res) {
    try {
        const expense = await expenseModel.find({ userId: req.user._id }).sort({ date: -1 });
        const plainData = expense.map((exp) => ({
            Description: exp.description,
            Amount: exp.amount,
            Category: exp.category,
            Date: new Date(exp.date).toLocaleDateString()
        }));

        const sheet = XLSX.utils.json_to_sheet(plainData);  //for converting data into excel sheet format.
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook, sheet, "expenseModel");
        XLSX.writeFile(workBook, "expense_details.xlsx");
        res.download("expense_details.xlsx");

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server bura maan gaya"
        })
    }
}


export async function getExpenseOverview(req, res) {
    try {
        const userId = req.user._id;
        const { range = "monthly" } = req.queryl;
        const { start, end } = getDateRange(range);

        const expense = await expenseModel.find({
            userId,
            date: { $gte: start, $lte: end },

        }).sort({ date: -1 });

        const totalExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);
        const averageExpense = expense.length > 0 ? totalExpense / expense.length : 0;
        const numberOfTransactions = expense.length;

        const recentTransactions = expense.slice(0, 5); 

        res.json({
            success: true,
            date: {
                totalExpense,
                averageExpense,
                numberOfTransactions,
                recentTransactions,
                range
            }
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server bura maan gaya"
        })
    }
}