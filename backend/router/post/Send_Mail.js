const express = require("express");
const axios = require("axios");
const db = require("../../config/DB/Db");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
async function getPasswordForEmail(email) {
  try {
    const response = await axios.get(
      "http://localhost:8081/api/user/loggedin/data",
      {
        params: { email },
      }
    );

    const user = response.data.find((user) => user.Email === email);
    // console.log(user,"user")

    if (user) {
      // console.log(user,"yeah")
      return user.password; // Return the password if user found
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching password:", error);
    throw error; // Rethrow or handle as necessary
  }
}

async function getUsernameForEmail(email) {
  try {
    const response = await axios.get(
      "http://localhost:8081/api/user/loggedin/data",
      {
        params: { email },
      }
    );
    const user = response.data.find((user) => user.Email === email);
    if (user) {
      return user.emp_name;
    } else {
      throw new Error("User not found");
    }
  } catch (error) {
    console.error("Error fetching username:", error);
    throw error; // Rethrow or handle as necessary
  }
}

const nodemailer = require("nodemailer");

router.post("/send-email", async (req, res) => {
  const {
    assignToEmail,
    assignToPersonEmails,
    hodemail,
    ax_brief,
    collection_name,
    project,
    no_of_qty,
    assign_date,
    target_date,
    priority,
  } = req.body;

  console.log("Assigned to Email:", assignToEmail);
  console.log("Person Emails:", assignToPersonEmails);

  try {
    const password = await getPasswordForEmail(assignToEmail);
    const username = await getUsernameForEmail(assignToEmail);
    console.log("Password:", password);
    console.log("Username:", username);

    const transporter = nodemailer.createTransport({
      host: "your.zimbra.server",
      port: 587,
      secure: false,
      auth: {
        user: assignToEmail,
        pass: password,
      },
    });

    const toEmails = [hodemail, ...assignToPersonEmails].filter(validateEmail);

    // If there are no valid email addresses, return an error
    if (toEmails.length === 0) {
      return res.status(400).send("No valid email addresses provided.");
    }

    const mailOptions = {
      from: `"${username}" <${assignToEmail}>`,
      to: toEmails.join(","),
      subject: "Task Assignment Notification",
      text: `Task Details:
                AX Brief: ${ax_brief}
                Collection Name: ${collection_name}
                Project: ${project}
                Number of Quantities: ${no_of_qty}
                Assigned Date: ${assign_date}
                Target Date: ${target_date}
                Priority: ${priority}`,
      html: `<b>Task Details:</b>
                <ul>
                    <li><b>AX Brief:</b> ${ax_brief}</li>
                    <li><b>Collection Name:</b> ${collection_name}</li>
                    <li><b>Project:</b> ${project}</li>
                    <li><b>Number of Quantities:</b> ${no_of_qty}</li>
                    <li><b>Assigned Date:</b> ${assign_date}</li>
                    <li><b>Target Date:</b> ${target_date}</li>
                    <li><b>Priority:</b> ${priority}</li>
                </ul>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).send("Failed to send email.");
  }
});

router.post(
  "/send-email/Party-visit",
  upload.single("image"),
  async (req, res) => {
    const {
      loggedemail,
      assignToPersonEmails,
      visit_date,
      partyname,
      description,
      status_data,
    } = req.body;

    const image = req.file;
    console.log("logged to Email:", loggedemail);
    console.log("Person Emails:", assignToPersonEmails);
    console.log("Image File:", image);

    try {
      const password = await getPasswordForEmail(assignToPersonEmails);
      const username = await getUsernameForEmail(assignToPersonEmails);

      const transporter = nodemailer.createTransport({
        host: "your.zimbra.server",
        port: 587,
        secure: false,
        auth: {
          user: assignToPersonEmails,
          pass: password,
        },
      });

      const toEmails = [assignToPersonEmails];
      const mailOptions = {
        from: `"${username}" <${assignToPersonEmails}>`,
        to: toEmails.join(","),
        subject: "Task Assignment Notification",
        text: `Task Details:
                Visit Date: ${visit_date}
                Party Name: ${partyname}
                Description: ${description}
                Status: ${status_data}`,
        html: `<b>Task Details:</b>
                <ul>
                    <li><b>Visit Date:</b> ${visit_date}</li>
                    <li><b>Party Name:</b> ${partyname}</li>
                    <li><b>Description:</b> ${description}</li>
                    <li><b>Status:</b> ${status_data}</li>
                </ul>`,
        attachments: image
          ? [
              {
                filename: image.originalname,
                content: image.buffer,
                contentType: image.mimetype,
              },
            ]
          : [],
      };

      await transporter.sendMail(mailOptions);
      res.status(200).send("Email sent successfully!");
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).send("Failed to send email.");
    }
  }
);

router.post("/send-email/Op-task", async (req, res) => {
  const { assignee, currentEmailid, phase, task, phase_id } = req.body;
  console.log("Assigned to Email:", assignee);
  console.log("Person Emails:", task);

  try {
    const password = await getPasswordForEmail(assignee);
    const username = await getUsernameForEmail(assignee);
    console.log("Password:", password);
    console.log("Username:", username);

    const transporter = nodemailer.createTransport({
      host: "your.zimbra.server",
      port: 587,
      secure: false,
      auth: {
        user: assignee,
        pass: password,
      },
    });

    const toEmails = currentEmailid;

    const mailOptions = {
      from: `"${username}" <${assignee}>`,
      to: toEmails,
      subject: "Operational Task Notification",
      text: `Operational Task Details:
                Phase Name: ${phase}
                Task: ${task}
                Phase: ${phase_id}
             `,
      html: `<b>Operational Task Details:</b>
                <ul>
  
                    <li><b>Phase Name:</b> ${phase_name}</li>
                    <li><b>Task:</b> ${task}</li>
                    <li><b>Phase:</b> ${phase}</li>
  
                </ul>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent successfully!");
  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).send("Failed to send email.");
  }
});

module.exports = router;
