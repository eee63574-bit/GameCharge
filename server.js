require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const ORDERS_FILE = path.join(__dirname, "orders.json");

function loadOrders() {
    try {
        if (!fs.existsSync(ORDERS_FILE)) {
            fs.writeFileSync(ORDERS_FILE, "[]");
        }

        return JSON.parse(
            fs.readFileSync(ORDERS_FILE, "utf8")
        );

    } catch (error) {
        console.error("خطأ بقراءة الطلبات:", error);
        return [];
    }
}

function saveOrders(orders) {
    fs.writeFileSync(
        ORDERS_FILE,
        JSON.stringify(orders, null, 2),
        "utf8"
    );
}

function generateOrderNumber() {
    const random = crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    return `GC-${random}`;
}


const PRODUCTS = {

    pubg: [
        {
            id: "pubg_60",
            name: "60 UC",
            price: 0
        },
        {
            id: "pubg_325",
            name: "325 UC",
            price: 0
        },
        {
            id: "pubg_660",
            name: "660 UC",
            price: 0
        },
        {
            id: "pubg_1800",
            name: "1800 UC",
            price: 0
        }
    ],

    freefire: [
        {
            id: "ff_100",
            name: "100 Diamonds",
            price: 0
        },
        {
            id: "ff_310",
            name: "310 Diamonds",
            price: 0
        },
        {
            id: "ff_520",
            name: "520 Diamonds",
            price: 0
        },
        {
            id: "ff_1060",
            name: "1060 Diamonds",
            price: 0
        }
    ],

    roblox: [
        {
            id: "roblox_400",
            name: "400 Robux",
            price: 0
        },
        {
            id: "roblox_800",
            name: "800 Robux",
            price: 0
        },
        {
            id: "roblox_1700",
            name: "1700 Robux",
            price: 0
        },
        {
            id: "roblox_4500",
            name: "4500 Robux",
            price: 0
        }
    ]
};


app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "index.html")
    );

});


app.get("/api/products", (req, res) => {

    res.json({

        success: true,

        currency:
            process.env.CURRENCY || "SYP",

        products: PRODUCTS

    });

});


app.post("/api/orders", (req, res) => {

    try {

        const {
            game,
            packageId,
            playerId,
            customerName,
            phone
        } = req.body;


        if (!game) {

            return res.status(400).json({
                success: false,
                message: "اللعبة مطلوبة"
            });

        }


        if (!packageId) {

            return res.status(400).json({
                success: false,
                message: "الباقة مطلوبة"
            });

        }


        if (!playerId) {

            return res.status(400).json({
                success: false,
                message: "Player ID مطلوب"
            });

        }


        if (!customerName) {

            return res.status(400).json({
                success: false,
                message: "اسم الزبون مطلوب"
            });

        }


        if (!phone) {

            return res.status(400).json({
                success: false,
                message: "رقم الهاتف مطلوب"
            });

        }


        const gameProducts =
            PRODUCTS[game];


        if (!gameProducts) {

            return res.status(400).json({
                success: false,
                message: "اللعبة غير موجودة"
            });

        }


        const product =
            gameProducts.find(
                item =>
                    item.id === packageId
            );


        if (!product) {

            return res.status(400).json({
                success: false,
                message: "الباقة غير موجودة"
            });

        }


        const order = {

            orderNumber:
                generateOrderNumber(),

            game:
                game,

            packageId:
                product.id,

            packageName:
                product.name,

            amount:
                product.price,

            currency:
                process.env.CURRENCY || "SYP",

            playerId:
                String(playerId),

            customerName:
                String(customerName),

            phone:
                String(phone),

            status:
                "pending_payment",

            paymentStatus:
                "unpaid",

            topupStatus:
                "not_started",

            createdAt:
                new Date().toISOString()

        };


        const orders =
            loadOrders();


        orders.push(order);


        saveOrders(orders);


        console.log(
            `طلب جديد: ${order.orderNumber}`
        );


        return res.status(201).json({

            success: true,

            message:
                "تم إنشاء الطلب",

            order: order,

            payment: {

                status:
                    "not_configured",

                message:
                    "بوابة الدفع لم يتم تفعيلها بعد"

            }

        });

    } catch (error) {

        console.error(
            "خطأ بإنشاء الطلب:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "حدث خطأ في السيرفر"

        });

    }

});


app.get(
    "/api/orders/:orderNumber",
    (req, res) => {

        const orderNumber =
            req.params.orderNumber;


        const orders =
            loadOrders();


        const order =
            orders.find(
                item =>
                    item.orderNumber ===
                    orderNumber
            );


        if (!order) {

            return res.status(404).json({

                success: false,

                message:
                    "الطلب غير موجود"

            });

        }


        return res.json({

            success: true,

            order: order

        });

    }
);


app.post(
    "/api/payment/webhook",
    (req, res) => {

        try {

            const event =
                req.body;


            console.log(
                "Payment webhook:",
                event
            );


            /*
                الدفع سيتم ربطه لاحقًا.

                عند الربط الحقيقي يجب:
                1. التحقق من توقيع بوابة الدفع
                2. استخراج رقم الطلب
                3. التأكد من المبلغ
                4. تغيير paymentStatus إلى paid
                5. بعدها تنفيذ الشحن
            */


            return res.json({

                received: true

            });

        } catch (error) {

            console.error(
                "Webhook error:",
                error
            );


            return res.status(500).json({

                received: false

            });

        }

    }
);


app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            service:
                "GameCharge",

            status:
                "online",

            paymentMode:
                process.env.ECASH_MODE ||
                "sandbox",

            topupMode:
                process.env.TOPUP_MODE ||
                "test"

        });

    }
);


app.listen(
    PORT,
    () => {

        console.log("");

        console.log(
            "================================"
        );

        console.log(
            "🎮 GameCharge Server"
        );

        console.log(
            "================================"
        );

        console.log(
            `Server running on port ${PORT}`
        );

        console.log(
            `Payment: ${
                process.env.ECASH_MODE ||
                "sandbox"
            }`
        );

        console.log(
            `TopUp: ${
                process.env.TOPUP_MODE ||
                "test"
            }`
        );

        console.log(
            "================================"
        );

        console.log("");

    }
);
