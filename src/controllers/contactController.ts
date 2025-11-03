import { Request, Response } from 'express';
import Contact, { IContactProduct } from '../models/Contact';

// Gửi contact message (có thể kèm products từ cart)
export const submitContact = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, message, products } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and message are required',
      });
    }

    // Calculate totals if products are provided
    let totalAmount = 0;
    let totalItems = 0;
    let processedProducts: IContactProduct[] = [];

    if (products && Array.isArray(products) && products.length > 0) {
      processedProducts = products.map((item: any) => {
        const subtotal = item.price * item.quantity;
        totalAmount += subtotal;
        totalItems += item.quantity;

        return {
          productId: item.productId || item._id,
          productName: item.name || item.productName,
          productImage: item.image || item.productImage,
          price: item.price,
          quantity: item.quantity,
          subtotal,
        };
      });
    }

    const contact = await Contact.create({
      name,
      email,
      phone,
      address: address || '',
      message,
      products: processedProducts,
      totalAmount: totalAmount > 0 ? totalAmount : undefined,
      totalItems: totalItems > 0 ? totalItems : undefined,
      status: 'new',
    });

    res.status(201).json({
      success: true,
      message: 'Contact message sent successfully',
      data: contact,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy tất cả contact messages (admin)
export const getContacts = async (req: Request, res: Response) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    const contacts = await Contact.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Contact.countDocuments(query);

    res.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đánh dấu là đã đọc hoặc cập nhật status
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status: status || 'read' },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.json({ success: true, data: contact });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete contact
export const deleteContact = async (req: Request, res: Response) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact not found' });
    }

    res.json({ 
      success: true, 
      message: 'Contact deleted successfully' 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
