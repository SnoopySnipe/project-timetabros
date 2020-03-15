import React, {Component} from 'react';
import {DayPilot, DayPilotCalendar} from "daypilot-pro-react";
import { getEventItems, createEventItem } from '../../../services/ScheduleService';
import AuthContext from '../../../context/AuthContext';
import { IconButton, Button } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import Moment from 'react-moment';

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
  static contextType = AuthContext;

  constructor(props) {
    super(props);
    this.state = {
      viewType: "Week",
          durationBarVisible: false,
          timeRangeSelectedHandling: "Enabled",
          headerDateFormat: "dddd MMMM d",
          onTimeRangeSelected: args => {
              let dp = this.calendar;
              let title = "";
              let desc = "";
              DayPilot.Modal.prompt("Create a new event:", "").then((modal) => {
                  dp.clearSelection();
                  if (!modal.result) { return; }
                  title = modal.result;
                  console.log("HELLO");
                  console.log(title);
                  console.log(desc);
                  DayPilot.Modal.prompt("Description:", "").then((modal) => {
                      dp.clearSelection();
                      if (!modal.result) { return; }
                      createEventItem(title, args.start.toDate(), args.end.toDate()).then(
                        (createdEventItem) => {
                          this.setState({
                            event: this.state.events.concat([{
                              id: createdEventItem._id,
                              text: createdEventItem.title, 
                              startdate:createdEventItem.startdate, 
                              enddate: createdEventItem.enddate
                            }])
                          });
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
                        }
                      );
                  });
              });
          },
          eventDeleteHandling: "Update",
          onEventDeleted: function (args) {
            console.log(args);
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
  }



  fetchEventItems() {
    getEventItems(this.context.authenticatedUser._id).then((response) => {
      console.log(response);
      let events = response.data.scheduleitems.map((item) => {

        let start = new Date(this.state.startDate);
        let itemStartDate = new Date(item.startdate);
        start.setDate(start.getDate() + (itemStartDate.getDay() - start.getDay()));
        start.setHours(itemStartDate.getHours());
        start.setMinutes(itemStartDate.getMinutes());
        start.setSeconds(0);
        start.setMilliseconds(0);
        let end = new Date(this.state.startDate);
        let itemEndDate = new Date(item.enddate);
        end.setDate(end.getDate() + (itemEndDate.getDay() - end.getDay()));
        end.setHours(itemEndDate.getHours());
        end.setMinutes(itemEndDate.getMinutes());
        end.setSeconds(0);
        end.setMilliseconds(0);
        return {start: start.toISOString(), end: end.toISOString(), text: item.title};
      });
      console.log(events);
      this.setState({
        events: events
      });
    });
  }

  componentDidMount() {
    this.setState({
      startDate: (new Date()).toISOString()
    });
    this.fetchEventItems();
  }

  updateWeekEventItems() {

  }
  render() {
    var {...config} = this.state;
    return (
      <div>
        <IconButton onClick={()=>{
          const date = new Date(this.state.startDate);
          date.setDate(date.getDate() - 7);
          this.setState({startDate: date.toISOString()});
          this.fetchEventItems();
          }}>
          <ArrowBackIosIcon />
        </IconButton>
        {"Week of "}
        <Moment format="MMM Do">
          {this.state.startDate}
        </Moment>
        <IconButton onClick={()=>{
          const date = new Date(this.state.startDate);
          date.setDate(date.getDate() + 7);
          this.setState({startDate: date.toISOString()});
          this.fetchEventItems();
          }}>
          <ArrowForwardIosIcon />
        </IconButton>
        
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