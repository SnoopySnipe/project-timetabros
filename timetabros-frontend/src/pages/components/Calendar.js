import React, {Component} from 'react';
import {DayPilot, DayPilotCalendar, DayPilotNavigator} from "daypilot-pro-react";
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

  constructor(props) {
    super(props);
    this.state = {
        viewType: "WorkWeek",
        durationBarVisible: false,
        timeRangeSelectedHandling: "Enabled",
        headerDateFormat: "dddd",
        onTimeRangeSelected: args => {
            let dp = this.calendar;
            DayPilot.Modal.prompt("Create a new event:", "").then(function(modal) {
            dp.clearSelection();
            if (!modal.result) { return; }
            dp.events.add(new DayPilot.Event({
                start: args.start,
                end: args.end,
                id: DayPilot.guid(),
                text: modal.result
            }));
            });
        },
        eventDeleteHandling: "Update",
        onEventDeleted: function (args) {
            this.message("Event deleted: " + args.e.text());
        },
        onEventClick: args => {
            console.log(this.calendar)
            console.log(args);
        },
        contextMenu: new DayPilot.Menu({
            items: [
                { text: "Edit", onClick: function (args) {
                    console.log(args);
                    DayPilot.Modal.prompt("Update event text:", args.source.text()).then(function(modal) {
                        if (!modal.result) { return; }
                        args.source.data.text = modal.result;
                        args.source.calendar.events.update(args.source);
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


    };
  }

  componentDidMount() {

    // load event data
    this.setState({
      events: []
    });
  }

  render() {
    var {...config} = this.state;
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