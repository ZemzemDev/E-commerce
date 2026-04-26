const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const User = require('../models/User');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_placeholder_replace_me');

// @desc    Create new order
// @route   POST /api/orders
exports.createOrder = async (req, res) => {
    const { orderItems, shippingAddress, paymentMethod, totalPrice } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400).json({ message: 'No order items' });
        return;
    } else {
        try {
            const order = await Order.create({
                UserId: req.user.id,
                shippingAddress,
                paymentMethod,
                totalPrice,
                orderItems: orderItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: item.price,
                orderItems: orderItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: item.price,
                    ProductId: item.product || item.id
                }))
            }, {

            res.status(201).json(order);
        } catch (error) {
            console.error('❌ SEVERE Order Creation Error:', error);
            res.status(500).json({ 
                message: 'Database Error: ' + error.message,
                detail: error.original?.detail || 'No further details'
            });
        }
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [
                { model: User, as: 'user', attributes: ['name', 'email'] },
                { model: OrderItem, as: 'orderItems' }
            ]
        });

        if (order) {
            const orderJson = order.toJSON();
            
            // Map ProductId to product for consistent naming in frontend
            if (orderJson.orderItems) {
                orderJson.orderItems = orderJson.orderItems.map(item => ({
                    ...item,
                    product: item.ProductId,
                    price: parseFloat(item.price)
                }));
            }
            
            res.json(orderJson);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order to paid
// @route   PUT /api/orders/:id/pay
exports.updateOrderToPaid = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id);

        if (order) {
            order.isPaid = true;
            order.paidAt = new Date();
            // Store payment result for tracking
            if (req.body) {
                order.paymentResult = JSON.stringify(req.body);
            }
            
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: 'Order not found for updating payment' });
        }
    } catch (error) {
        console.error('❌ Database Error updating payment:', error);
        res.status(500).json({ 
            message: 'Failed to update order to paid status: ' + (error.original?.detail || error.message) 
        });
    }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.findAll({
            where: { UserId: req.user.id },
            include: [{ model: OrderItem, as: 'orderItems' }]
        });
        
        // Map id to _id and parse prices for frontend compatibility
        const mappedOrders = orders.map(o => {
            const json = o.toJSON();
            json.totalPrice = parseFloat(json.totalPrice);
            if (json.orderItems) {
                json.orderItems = json.orderItems.map(item => ({
                    ...item,
                    product: item.ProductId,
                    price: parseFloat(item.price)
                }));
            }
            return json;
        });
        res.json(mappedOrders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create Stripe Checkout Session
// @route   POST /api/orders/:id/create-checkout-session
exports.createStripeCheckoutSession = async (req, res) => {
    try {
        const order = await Order.findByPk(req.params.id, {
            include: [{ model: OrderItem, as: 'orderItems' }]
        });

        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const line_items = order.orderItems.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: [item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e'],
                },
                unit_amount: Math.round(item.price * 100), // Stripe expects cents
            },
            quantity: item.qty,
        }));

        const origin = req.get('origin') || 'http://localhost:5173';
        
        // Mock behavior if no valid secret key is provided (for dev demo purposes)
        if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY === 'sk_test_mock_placeholder_replace_me') {
            return res.json({ 
                id: 'mock_session_123', 
                url: `${origin}/order/${order.id}?success=true&session_id=mock_session_123` 
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items,
            mode: 'payment',
            success_url: `${origin}/order/${order.id}?success=true&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/order/${order.id}?canceled=true`,
            client_reference_id: order.id.toString(),
            customer_email: req.user.email,
        });

        res.json({ id: session.id, url: session.url });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Stripe Payment
// @route   POST /api/orders/:id/verify-payment
exports.verifyStripePayment = async (req, res) => {
    const { session_id } = req.body;
    try {
        if (process.env.STRIPE_SECRET_KEY === undefined || process.env.STRIPE_SECRET_KEY === 'sk_test_mock_placeholder_replace_me') {
            // Mock behavior if no valid secret key is provided (for dev demo purposes)
            const order = await Order.findByPk(req.params.id);
            if (order && !order.isPaid) {
                order.isPaid = true;
                order.paidAt = new Date();
                await order.save();
            }
            return res.json({ message: 'Payment verified (Mocked)', isPaid: true });
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);
        if (session.payment_status === 'paid') {
            const order = await Order.findByPk(req.params.id);
            if (order) {
                if (!order.isPaid) {
                    order.isPaid = true;
                    order.paidAt = new Date();
                    await order.save();
                }
                res.json({ message: 'Payment verified successfully', isPaid: true });
            } else {
                res.status(404).json({ message: 'Order not found' });
            }
        } else {
            res.status(400).json({ message: 'Payment not successful' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
