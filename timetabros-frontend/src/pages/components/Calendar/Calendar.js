import React, {Component} from 'react';
import {DayPilot, DayPilotCalendar} from "daypilot-pro-react";

//import "./CalendarStyles.css";

const styles = {
  left: {
    float: "left",
    width: "220px"
  },
  main: {
    marginLeft: "220px"
  }
};

class Calendar extends Component {

  state = {
      
  };

  config = {
    viewType: "WorkWeek",
        durationBarVisible: false,
        timeRangeSelectedHandling: "Enabled",
        headerDateFormat: "dddd",
        onTimeRangeSelected: args => {
            let dp = this.calendar;
            let title = "";
            let desc = "";
            DayPilot.Modal.prompt("Create a new event:", "").then(function(modal) {
                dp.clearSelection();
                if (!modal.result) { return; }
                title = modal.result;
                console.log("HELLO");
                console.log(title);
                console.log(desc);
                DayPilot.Modal.prompt("Description:", "").then(function(modal) {
                    dp.clearSelection();
                    if (!modal.result) { return; }
                    desc = modal.result;
                    console.log("HELLO");
                    console.log(title);
                    console.log(desc);
                    dp.events.add(new DayPilot.Event({
                        start: args.start,
                        end: args.end,
                        id: DayPilot.guid(),
                        text: title,
                        attendants:[],
                        description: desc
                    }));
                });
            });
        },
        eventDeleteHandling: "Update",
        onEventDeleted: function (args) {
            this.message("Event deleted: " + args.e.text());
        },
        onEventClick: args => {
            console.log(args);
            console.log(args.e.data.description);
        },
        contextMenu: new DayPilot.Menu({
            items: [
                { text: "Edit", onClick: function (args) {
                    console.log(args);
                    DayPilot.Modal.prompt("Update event text:", args.source.text()).then(function(modal) {
                        if (!modal.result) { return; }
                        args.source.data.text = modal.result;
                        args.source.calendar.events.update(args.source);
                        args.source.data.attendants.push("Jeff");
                    });
                }},
                { text: "Delete", onClick: function (args) {
                    DayPilot.Modal.confirm("Delete Event?").then(function(modal) {
                        if (!modal.result) { return; }
                        args.source.calendar.events.remove(modal);
                    });
                }},
            ]
        }),
  }



  componentDidMount() {

    // load event data
    this.setState({
      events: []
    });
  }

  render() {
    var {...config} = this.config;
    return (
      <div>
        <DayPilotCalendar
          {...config}
          ref={component => {
            this.calendar = component && component.control;
          }}
        />
      </div>
    );
  }
}

export default Calendar;