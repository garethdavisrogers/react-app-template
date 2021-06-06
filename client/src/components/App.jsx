import React from "react";
import axios from "axios";

class App extends React.Component {
  constructor() {
    super();

    this.state = { data: [] };
  }

  componentDidMount() {
    let sessionObj = {
      sessionsByUser: {},
    };
    axios
      .get(
        "https://candidate.hubteam.com/candidateTest/v3/problem/dataset?userKey=e3904e18563be46af25719b2ac33"
      )
      .then((res) => {
        let newObj = Object.create(sessionObj);
        let events = res.data.events;
        const eventLimit = 600000;
        events.forEach((event) => {
          let user = event.visitorId;
          let timestamp = event.timestamp;
          let page = event.url;
          if (newObj.sessionsByUser[user] === undefined) {
            newObj.sessionsByUser[user] = [
              { duration: 0, pages: [page], startTime: timestamp },
            ];
          } else {
            let userEvents = newObj.sessionsByUser[user];
            let checkDur = (userEvents, timestamp, page) => {
              for (let i = 0; i < userEvents.length; i++) {
                let event = userEvents[i];
                let dur = timestamp - event.startTime;
                let sameSession = dur < eventLimit;
                if (sameSession) {
                  event.duration += dur;
                  if (event.pages.includes(page)) {
                    return;
                  }
                  if (timestamp < event.startTime) {
                    event.pages.unshift(page);
                    return;
                  }
                  if (timestamp >= event.startTime) {
                    event.pages.push(page);
                    return;
                  }
                }
              }
              userEvents.push({
                duration: 0,
                pages: [page],
                startTime: timestamp,
              });
              userEvents.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
            };
            checkDur(userEvents, timestamp, page);
          }
        });
        console.log(newObj.sessionsByUser);
        axios
          .post(
            "https://candidate.hubteam.com/candidateTest/v3/problem/result?userKey=e3904e18563be46af25719b2ac33",
            newObj
          )
          .then((res) => {
            console.log(res);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  render() {
    return <div>Hello World</div>;
  }
}

export default App;
