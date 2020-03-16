import React, {Component} from 'react';
import {DayPilot, DayPilotCalendar} from "daypilot-pro-react";
import { getEventItems, createEventItem, deleteEventItem, updateEventItemTime, updateEventItemTitle } from '../../../services/ScheduleService';
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
      calendarOwner: props.targetSchedule,
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
            DayPilot.Modal.prompt("Description:", "").then((modal) => {
                dp.clearSelection();
                if (!modal.result) { return; }
                desc = modal.result;
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

                    this.fetchEventItems(this.state.calendarOwner);
                    //this.fetchEventItems("5e692e2cac7ccf00b9e1d71b");
                    // dp.events.add(new DayPilot.Event({
                    //     start: args.start,
                    //     end: args.end,
                    //     id: createdEventItem._id,
                    //     text: title,
                    //     attendants:[],
                    //     description: desc
                    // }));
                  }
                );
            });
        });
      },
      eventDeleteHandling: "Update",
      onEventDeleted: function (args) {
        console.log('dete');
        this.message("Event deleted: " + args.e.text());
      },
      onEventMoved: args => {
        console.log(args);
        updateEventItemTime(args.e.data.id, args.newStart.toDate(), args.newEnd.toDate()).then(
          () => {
            this.fetchEventItems(this.state.calendarOwner);
          }
        );
      },
      onEventClick: args => {
          console.log(args);
          console.log(args.e.data.description);
      },
      contextMenu: new DayPilot.Menu({
        items: [
          { text: "Edit", onClick: (args) => {
              console.log(args);
              DayPilot.Modal.prompt("Update event text:", args.source.text()).then((modal) => {
                  if (!modal.result) { return; }
                  updateEventItemTitle(args.source.data.id, modal.result).then(
                    () => {
                      args.source.data.text = modal.result;
                      args.source.calendar.events.update(args.source);
                      this.fetchEventItems(this.state.calendarOwner);
                    }
                  );

              });
            }
          },
          { text: "Delete", onClick: (args) => {
              DayPilot.Modal.confirm("Delete Event?").then((modal) => {
                  if (!modal.result) { return; }
                  console.log(args);
                  deleteEventItem(args.source.data.id).then(() => {
                    args.source.calendar.events.remove(modal);
                    this.fetchEventItems(this.state.calendarOwner);
                  });
              });
            }
          },
        ]
      }),
    }
  }

  authorizeCalendar(){
    console.log("properCalendarOwner");
    let properCalendarOwner = this.state.calendarOwner ? this.state.calendarOwner : this.context.authenticatedUser._id; 
    console.log(properCalendarOwner);
    this.setState({
      calendarOwner: properCalendarOwner
    },() =>{
      // If user is not Calendar Owner
      if (this.state.calendarOwner != this.context.authenticatedUser._id){
        console.log("NOT AUTHORIZED");
        this.setState({
          timeRangeSelectedHandling: "Disabled",
          eventClickHandling: "Disabled",
          eventRightClickHandling: "Disabled",
          eventMoveHandling: "Disabled",
          eventResizeHandling: "Disabled",
        })
      } else { 
        console.log("AUTHORIZED");
      }
      this.fetchEventItems(this.state.calendarOwner);
    });
  }

  fetchEventItems(userId) {
    //getEventItems(this.context.authenticatedUser._id).then((response) => {
    console.log("USERID");
    console.log(userId);
    getEventItems(userId).then((response) => {      
      let events = response.data.scheduleitems ? response.data.scheduleitems.map((item) => {

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
        return {start: start.toISOString(), end: end.toISOString(), text: item.title, id: item.ID};
      }) : [];
      // console.log(events);
      this.setState({
        events: events
      });
      // console.log(this.state.events);
    })
    // Not sure if we need this
    .catch(error => {
      console.error("userId "+userId+" does not exist", error);
    });
  }

  componentDidMount() {
    this.setState({
      startDate: (new Date()).toISOString()
    });
    this.authorizeCalendar();
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
          this.fetchEventItems(this.state.calendarOwner);
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
          this.fetchEventItems(this.state.calendarOwner);
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