// Builds a complete, independent tenant: company + workspace + admin + two
// agents + customer + chat + ticket + message, with a signed auth cookie for
// every principal.
//
// Two agents matter: the whole point of the isolation matrix is proving an
// agent cannot reach a conversation assigned to a *different* agent in the
// same company, which a single-agent fixture cannot express.
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../src/config/config.js";

import companyModel from "../../src/models/company.model.js";
import workspaceModel from "../../src/models/workSpace.model.js";
import adminModel from "../../src/models/admin.model.js";
import agentModel from "../../src/models/aget.model.js";
import userModel from "../../src/models/user.model.js";
import chatModel from "../../src/models/chat.model.js";
import ticketModel from "../../src/models/ticket.model.js";
import messageModel from "../../src/models/message.model.js";

export const PASSWORD = "TestPassw0rd!";

// Mirrors generateToken()'s payload exactly. Tests sign directly rather than
// logging in, so a change to the JWT shape breaks these loudly.
export const cookieFor = (principal) => {
  const token = jwt.sign(
    {
      userId: principal._id.toString(),
      email: principal.email,
      role: principal.role,
      companyId: principal.companyId ? principal.companyId.toString() : null,
      workspaceId: principal.workspaceId ? principal.workspaceId.toString() : null,
    },
    config.JWT_SECRET,
    { expiresIn: "1h" },
  );
  return `token=${token}`;
};

export const expiredCookieFor = (principal) =>
  `token=${jwt.sign(
    { userId: principal._id.toString(), email: principal.email, role: principal.role },
    config.JWT_SECRET,
    { expiresIn: -10 },
  )}`;

let seq = 0;

/**
 * @param {string} tag  short label ("A"/"B") that namespaces every unique field
 */
export async function buildTenant(tag = "A") {
  const n = ++seq;
  const hash = await bcrypt.hash(PASSWORD, 4); // low cost: these are throwaway
  const slug = `${tag.toLowerCase()}-co-${n}`;

  // company.adminId and admin.companyId reference each other, so the admin is
  // created unlinked first and joined to the company once it exists.
  const admin = await adminModel.create({
    fullName: `Admin ${tag}`,
    email: `admin-${slug}@test.dev`,
    password: hash,
    isVerified: true,
  });

  const company = await companyModel.create({
    name: `Tenant ${tag}`,
    slug,
    email: `billing@${slug}.test`,
    phone: "+1000000000",
    website: `https://${slug}.test`,
    size: "11-50",
    address: "1 Test Street",
    country: "Testland",
    adminId: admin._id,
  });

  admin.companyId = company._id;
  await admin.save();

  const workspace = await workspaceModel.create({
    name: `Workspace ${tag}`,
    slug: `${slug}-ws`,
    companyId: company._id,
    owner: admin._id,
  });

  // A second workspace in the same company, so header-scoping tests can prove
  // an admin is narrowed *within* their own tenant, not just across tenants.
  const workspaceTwo = await workspaceModel.create({
    name: `Workspace ${tag} 2`,
    slug: `${slug}-ws2`,
    companyId: company._id,
    owner: admin._id,
  });

  company.workSpaceId = workspace._id;
  await company.save();

  const mkAgent = (label) =>
    agentModel.create({
      name: `Agent ${tag}${label}`,
      email: `agent${label}-${slug}@test.dev`,
      password: hash,
      companyId: company._id,
      workspaceId: workspace._id,
      isVerified: true,
      status: "online",
    });

  const agent = await mkAgent("1"); // owns the chat/ticket below
  const otherAgent = await mkAgent("2"); // same company, assigned nothing

  const customer = await userModel.create({
    name: `Customer ${tag}`,
    email: `customer-${slug}@test.dev`,
    password: hash,
    companyId: company._id,
    workspaceId: workspace._id,
    isVerified: true,
  });

  const otherCustomer = await userModel.create({
    name: `Customer ${tag} 2`,
    email: `customer2-${slug}@test.dev`,
    password: hash,
    companyId: company._id,
    workspaceId: workspace._id,
    isVerified: true,
  });

  const chat = await chatModel.create({
    company: company._id,
    workspaceId: workspace._id,
    user: customer._id,
    assignedAgent: agent._id,
  });

  const ticket = await ticketModel.create({
    // Explicit: the model's pre-save default is Date.now().slice(-6), which
    // collides when a suite creates several tickets in the same millisecond.
    ticketNumber: `TKT-${tag}${n}${Math.floor(Math.random() * 10000)}`,
    title: `Ticket for tenant ${tag}`,
    description: `A description belonging strictly to tenant ${tag}.`,
    companyId: company._id,
    customerId: customer._id,
    assignedAgent: agent._id,
    chat: chat._id,
    createdBy: customer._id,
    createdByModel: "user",
  });

  chat.ticket = ticket._id;
  await chat.save();

  const message = await messageModel.create({
    chat: chat._id,
    content: `Secret message inside tenant ${tag}.`,
    role: "user",
    sender: customer._id,
    senderModel: "user",
  });

  return {
    tag,
    company,
    workspace,
    workspaceTwo,
    admin,
    agent,
    otherAgent,
    customer,
    otherCustomer,
    chat,
    ticket,
    message,
    cookies: {
      admin: cookieFor(admin),
      agent: cookieFor(agent),
      otherAgent: cookieFor(otherAgent),
      customer: cookieFor(customer),
      otherCustomer: cookieFor(otherCustomer),
    },
  };
}

export const oid = () => new mongoose.Types.ObjectId().toString();
