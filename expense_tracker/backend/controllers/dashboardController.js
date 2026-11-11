import incomeModel from "../models/Income.js";
import expenseModel from "../models/Expense.js";

export async function getDashboardOverview(req, res) {
    const userId = req.user._id;
    const now = new Date();
    const startOfTheMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfTheMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    try {
        let incomes = await incomeModel.find({
            userId,
            date: { $gte: startOfTheMonth, $lte: endOfTheMonth },
        }).lean();

        let expenses = await expenseModel.find({
            userId,
            date: { $gte: startOfTheMonth, $lte: endOfTheMonth },
        }).lean();

        const allIncomes = await incomeModel.find({ userId }).sort({ date: -1 }).lean();
        const allExpenses = await expenseModel.find({ userId }).sort({ date: -1 }).lean();

        if (incomes.length === 0 && expenses.length === 0 && (allIncomes.length > 0 || allExpenses.length > 0)) {
            incomes = allIncomes;
            expenses = allExpenses;
        }

        const monthlyIncome = incomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const monthlyExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const savings = monthlyIncome - monthlyExpense;
        const savingsRate = monthlyIncome === 0 ? 0 : Math.round((savings / monthlyIncome) * 100);

        const recentTransactions = [
            ...allIncomes.map((i) => ({ ...i, type: "income" })),
            ...allExpenses.map((e) => ({ ...e, type: "expense" })),
        ].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)).slice(0, 10);

        const spendByCategory = {};
        for (const exp of expenses) {
            const cat = exp.category || "Other";
            spendByCategory[cat] = (spendByCategory[cat] || 0) + Number(exp.amount || 0);
        }

        const expenseDistribution = Object.entries(spendByCategory).map(([category, amount]) => ({
            category,
            amount,
            percent: monthlyExpense === 0 ? 0 : Math.round((amount / monthlyExpense) * 100),
        }));

        return res.status(200).json({
            success: true,
            data:{
                monthlyIncome,
                monthlyExpense,
                savings,
                savingsRate,
                recentTransactions,
                spendByCategory,
                expenseDistribution
            }
        });

    } catch (error) {
        console.log("Error in getting dashboard overview :", error);
        return res.status(500).json({
            success: false,
            message:"Server bura maan gaya :("
        });
    }
}
