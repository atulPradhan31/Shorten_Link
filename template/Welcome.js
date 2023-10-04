module.exports = template = (link, userName) => {
  return `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Forgot Password</title>
        <style>
          /* Reset some default styles */
          body,
          body * {
            box-sizing: border-box;
            font-family: Arial, sans-serif;
          }

          /* Styles for the email container */
          .email-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border : 1px solid #008800;
            background-color: #f2f2f2;
          }

          /* Heading styles */
          h1 {
            color: #333333;
            margin-bottom: 20px;
          }

          /* Button styles */
          .reset-button {
            display: block;
            margin: 20px auto;
            padding: 10px 20px;
            background-color: #008000;
            color: #ffffff;
            text-decoration: none;
            border-radius: 4px;
            text-align: center;
            width: fit-content;
          }

          /* Footer styles */
          .footer {
            margin-top: 20px;
            color: #888888;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <h1>Welcome to Linkify </h1>
          <h2>Your Ultimate Link Management Tool!</h2>
          <p>Hello, ${userName}</p>
          <p>Welcome to Linkify, your go-to destination for seamless link management! We're thrilled to have you join our community and embark on a journey of streamlined link sharing and enhanced user experiences</p>
          <p>With Linkify, you have the power to transform long, complex URLs into sleek and shareable short links that are not only easy to remember but also customizable to suit your needs</p>
          <p style="text-align: center;">
            <a href=${link} class="reset-button">Dashboard</a>
          </p>
          <p> Thank you for choosing Linkify to elevate your link management experience. We're excited to see the amazing things you'll achieve with our platform.</p>
          <p class="footer">If you have any questions, please contact our support team.</p>
        </div>
      </body>
      </html>

  `;
};
