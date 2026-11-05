const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const fetch = require("node-fetch");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const express = require("express");
const app = express();
app.use(bodyParser.json());
const cors = require("cors")({origin: true});
// runs every day at 00:00 am and reset the actionsNuumber for users
exports.scheduledFunction = functions.pubsub
    .schedule("0 14 * * *")
    .onRun(async (context) => {
      const usersSnapshot = await admin.firestore().collection("users").get();
      const users = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        userAchievements: doc.data().userAchievements || [],
      }));

      const promises = users.map((user) => {
        const achievements = user.userAchievements.map((achievement) => {
          if (achievement.actionsNumber !== undefined) {
            return {...achievement, actionsNumber: 0};
          } else {
            return achievement;
          }
        });

        return admin.firestore().doc(`users/${user.id}`).update({
          userAchievements: achievements,
        });
      });

      await Promise.all(promises);
      console.log("Actions number reset complete");
    });

// Define the function that will send message
exports.onButtonClick = functions.https.onCall(async (data, context) => {
  // Get the user ID from the client-side
  const token = data;
  const payload = {
    "token": token,
    "notification": {
      "title": "You got a friend request",
      "body": "click here to see the request",
    },
    "webpush": {
      "fcm_options": {
        "link": "https://regroup-a4654.web.app/myFriends",
      },
    },
  };
  console.log(payload);
  admin.messaging().send(payload).then((response) => {
    // Response is a message ID string.
    functions.logger.log("Successfully sent message: ", response);
  }).catch((error) => {
    functions.logger.log("error: ", error);
  });
});
// send message by alert of groups
exports.alertGroupAdded = functions.https.onCall(async (data, context) => {
  // Get the user ID from the client-side
  const token=data.token;
  const title=data.title;
  const message=data.message;
  const payload = {
    token,
    notification: {
      title: title,
      body: message,
    },
  };
  console.log(payload);
  admin.messaging().send(payload).then((response) => {
    // Response is a message ID string.
    functions.logger.log("Successfully sent message: ", response);
  }).catch((error) => {
    functions.logger.log("error: ", error);
  });
});
// send message by alert of groups
exports.alertGroupEdited = functions.https.onCall(async (data, context) => {
  // Get the user ID from the client-side
  const token=data.token;
  const title=data.title;
  const message=data.message;
  const payload = {
    token,
    notification: {
      title: title,
      body: message,
    },
  };
  console.log(payload);
  admin.messaging().send(payload).then((response) => {
    // Response is a message ID string.
    functions.logger.log("Successfully sent message: ", response);
  }).catch((error) => {
    functions.logger.log("error: ", error);
  });
});
// Create a transporter object using SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    // Set these in functions/.env (not committed), e.g.:
    // GMAIL_USER=...   GMAIL_APP_PASSWORD=...
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});
// Create a function to send email
exports.sendMailOverHTTP = functions.https.onRequest((req, res) => {
  // for testing purposes
  console.log("The request object is:", JSON.stringify(req.body));
  // enable CORS using the `cors` express middleware.
  cors(req, res, () => {
    // get contact form data from the req and then assigned it to variables
    const email = req.body.email;
    const subject = req.body.subject;
    const message = req.body.message;
    // config the email message
    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: subject,
      text: message,
    };
    // call the built in sendMail function
    return transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).send({
          data:
              {
                "status": 500,
                "message": error.toString(),
              }},
        );
      }
      return res.status(200).send( {
        data:
        {
          "status": 200,
          "message": "sent",
        }},
      );
    },
    );
  });
});
// send messages 5 min before start group
const db = admin.firestore();
exports.FCMNotification5MinGroup = functions.pubsub.schedule("every 3 minutes")
    .onRun(async (context) => {
      const activeGroupsRef = db.collection("activeGroups");
      // בודק את הזמן עכשיו ובעוד 5 דק
      const now = new Date();
      const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);
      const activeGroupsSnapshot = await activeGroupsRef.get();
      activeGroupsSnapshot.forEach(async (doc) => {
        const group = doc.data();
        const timeStamp = doc.data().timeStamp;
        const timestampDate = new Date(
            timeStamp._seconds * 1000 + timeStamp._nanoseconds / 1000000);
        // בודק אם הקבוצה נמצאת בטווח 5 דק מעכשיו
        if (timestampDate >= now && timestampDate < fiveMinutesLater) {
          const participants = doc.data().participants;
          for (const participant of participants) {
            const docRefToken = db.doc(`fcmTokens/${participant.userRef}`);
            const docSnapToken = await docRefToken.get();
            const data = docSnapToken.data();
            // אם קיים שולח למנהל הודעה שונה מהשאר
            if (data) {
              if (participant.userRef===group.managerRef) {
                const token = data.fcmToken;
                const title = "Reminder";
                const message = "In a few minutes your "+
                JSON.stringify(group.groupTittle)+
                " group is meat up"+
                ". If you participate in another group,"+
                " you will be removed.";
                const payload = {
                  token,
                  notification: {
                    title: title,
                    body: message,
                  },
                };
                admin.messaging().send(payload).then((response) => {
                  functions.logger.log("Successfully sent message: ", response);
                }).catch((error) => {
                  functions.logger.log("error: ", error);
                });
              } else {
                const token = data.fcmToken;
                const title = "Reminder";
                const message = "In a few minutes we start to learn "+
                JSON.stringify(group.groupTittle);
                const payload = {
                  token,
                  notification: {
                    title: title,
                    body: message,
                  },
                };
                admin.messaging().send(payload).then((response) => {
                  functions.logger.log("Successfully sent message: ", response);
                }).catch((error) => {
                  functions.logger.log("error: ", error);
                });
              }
            }
            if (participant.userRef===group.managerRef) {
              fetch(
                  "https://us-central1-regroup-a4654.cloudfunctions.net/sendMailOverHTTP",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      subject: `Reminder`,
                      email: JSON.stringify(participant.email),
                      message: "In a few minutes your "+
                      JSON.stringify(group.groupTittle)+
                      " group is meat up"+
                      ". If you participate as a member of another group,"+
                      " you will be removed. "+
                      ". you can see here the details here : https://regroup-a4654.web.app/myGroups",
                    }),
                  },
              )
                  .then((response) => response.text())
                  .then((data) => console.log(data))
                  .catch((error) => console.error(error));
            } else {
              fetch(
                  "https://us-central1-regroup-a4654.cloudfunctions.net/sendMailOverHTTP",
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      subject: `Reminder`,
                      email: JSON.stringify(participant.email),
                      message: "In a few minutes we start to learn "+
                      JSON.stringify(group.groupTittle)+
                      ". you can see here the details here : https://regroup-a4654.web.app/myGroups",
                    }),
                  },
              )
                  .then((response) => response.text())
                  .then((data) => console.log(data))
                  .catch((error) => console.error(error));
            }
          }
        }
      });
    });

// delete active groups on 00:00 am
exports.DeleteActiveGroups = functions.pubsub.schedule("0 14 * * *")
    .onRun(async (context) => {
      const activeGroupsRef = db.collection("activeGroups");
      const activeGroupsSnapshot = await activeGroupsRef.get();
      const updatePromises = [];
      activeGroupsSnapshot.forEach(async (doc) => {
        const group = doc.data();
        const groupId = doc.id;
        if (groupId !== "test") {
          const participants = group.participants;
          for (const participant of participants) {
            const docRef = db.doc(`users/${participant.userRef}`);
            const docSnap = await docRef.get();
            const data = docSnap.data();
            // אם קיים מעדכן את הקבוצה בדאטה של היוזר
            if (data) {
              const JoinedGroup = {
                course: group.groupTittle,
                subjects: group.groupTags,
                icon: "https://firebasestorage.googleapis.com/v0/b/regroup-a4654.appspot.com/o/images%2FjoinGroup.png?alt=media&token=293b90df-3802-4736-b8cc-0d64a8c3faff",
                text: group.description,
                type: "groups",
                timeStamp: group.timeStamp,
              };
              data.recentActivities.push(JoinedGroup);
            }
            updatePromises.push(admin.firestore()
                .doc(`users/${participant.userRef}`)
                .update({
                  recentActivities: data.recentActivities,
                }));
          }
          // מוחק את הקבוצה
          updatePromises.push(admin.firestore()
              .doc(`activeGroups/${groupId}`).delete());
        }
      });
      await Promise.all(updatePromises);
    });
