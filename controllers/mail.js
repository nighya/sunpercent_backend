const nodemailer = require('nodemailer');
const senderInfo = require('../senderInfo.json');
// 메일발송 객체
const mailSender = {
  // 메일발송 함수
  sendMail:function (param) {
    var transporter = nodemailer.createTransport({
    //   service: 'daum',   // 메일 보내는 곳
    // host: mx1.improvmx.com
      //port: 587
      port: 465,
      host: 'smtp.gmail.com',  
      secure: true,  
      auth: {
        user: senderInfo.user,  // 보내는 메일의 주소
        pass: senderInfo.pass   // 보내는 메일의 비밀번호
      }
    });
    // 메일 옵션
    var mailOptions = {
      from: "help@sunpercent.com", // 보내는 메일의 주소
      to: param.toEmail, // 수신할 이메일
      subject: param.subject, // 메일 제목
      text: param.text // 메일 내용
    };
    
    // 메일 발송    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("메일에러   :  " + error);
      } else {
        console.log('Email sent 성공  :  ' + info.response);
      }
    });

  }
}

module.exports = mailSender;