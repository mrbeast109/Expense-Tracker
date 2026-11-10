import incomeModel from "../models/Income.js";
import XLSX from "xlsx"; 
import getDateRange from "../utils/dataFilter.js";

export async function addIncome(req,res){
    const userId = req.user._id;
    const {description,amount,category,date} = req.body;

    try {
        if(!description ||!amount ||!category ||!date){
            return res.status(400).json({
                success: false,
                message:"Saare fields bharo!"
            })
        }

        const newIncome = new incomeModel({
            userId,
            description,
            amount,
            category,
            date
        })

        await newIncome.save();
        res.status(201).json({
            success: true,
            message: "Income add kar di!",
            data: newIncome
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server bura maan gaya"
        });
    }
}

export async function getIncome(req,res){
    const userId = req.user._id;

    try {
        const income = await incomeModel.find({userId}).sort({date: -1});
        res.json({sucess:true, income}); 
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message:"Server bura maan gaya"
        })
    }
}

export async function updateIncome(req,res){
    const {id} = req.params;
    const userId = req.user._id;
    const {description,amount} = req.body;

    try {
        const updatedIncome = await incomeModel.findOneAndUpdate(
            {_id: id,userId},
            {description,amount},
            {new: true}
        );

        if(!updatedIncome){
            return res.status(404).json({
                success: false,
                message: "Income nhi mila"
            })
        }

        res.json({success: true, message: "Income update kardiya hai",data: updatedIncome});
    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server bura maan gaya"
        })
    }
}

export async function deleteIncome(req,res){
    const userId = req.params.id;

    try {
        const income = await incomeModel.findByIdAndDelete(userId);
        if(!income){
            return res.status(404).json({
                success: false,
                message: "Income hai bhi?"
            })
        }

        return res.json({
            success: true,
            message: "Income delete ho gaya"
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Server bura maan gaya"
        })
    }
}

export async function downloadIncome(req,res){  //download income

    try {
        const income = await incomeModel.find({userId:req.user._id}).sort({date: -1});
        const plainData = income.map((inc) => ({
            Description: inc.description,
            Amount: inc.amount,
            Category: inc.category,
            Date: new Date(inc.date).toLocaleDateString()
        }));

        const sheet = XLSX.utils.json_to_sheet(plainData);  //for converting data into excel sheet format.
        const workBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workBook,sheet,"incomeModel");
        XLSX.writeFile(workBook,"income_details.xlsx");
        res.download("income_details.xlsx");
    
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server bura maan gaya"
        })
    }
}

export async function getIncomeOverView(req,res){
    try {
        const userId = req.user._id;
        const {range = "monthly"} = req.queryl;
        const {start,end} = getDateRange(range);

        const incomes = await incomeModel.find({
            userId,
            date: {$gte: start, $lte: end},

        }).sort({date: -1});

        const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);  //total income
        const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;    //avg income
        const numberOfTransactions = incomes.length;

        const recentTransactions = incomes.slice(0, 9);

        res.json({
            success: true,
            date: {
                totalIncome,
                averageIncome,
                numberOfTransactions,
                recentTransactions
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