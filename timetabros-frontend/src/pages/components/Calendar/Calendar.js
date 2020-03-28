import React, {Component} from 'react';
import {DayPilot, DayPilotCalendar} from "daypilot-pro-react";
import { getEventItems, createEventItem, deleteEventItem, updateEventItemTime, updateEventItemTitle } from '../../../services/ScheduleService';
import { IconButton } from '@material-ui/core';
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
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      events: [],
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

                    //this.fetchEventItems(this.props.user._id);
                  }
                );
            });
        });
      },
      eventDeleteHandling: "Update",
      onEventDeleted: function (args) {
        this.message("Event deleted: " + args.e.text());
      },
      onEventMoved: args => {
        updateEventItemTime(args.e.data.id, args.newStart.toDate(), args.newEnd.toDate()).then(
          () => {
            this.fetchEventItems(this.props.user._id);
          }
        );
      },
      onEventClick: args => {

      },
      contextMenu: new DayPilot.Menu({
        items: [
          { text: "Edit", onClick: (args) => {
              DayPilot.Modal.prompt("Update event text:", args.source.text()).then((modal) => {
                  if (!modal.result) { return; }
                  updateEventItemTitle(args.source.data.id, modal.result).then(
                    () => {
                      args.source.data.text = modal.result;
                      args.source.calendar.events.update(args.source);
                      this.fetchEventItems(this.props.user._id);
                    }
                  );

              });
            }
          },
          { text: "Delete", onClick: (args) => {
              DayPilot.Modal.confirm("Delete Event?").then((modal) => {
                  if (!modal.result) { return; }
                  deleteEventItem(args.source.data.id).then(() => {
                    args.source.calendar.events.remove(modal);
                    this.fetchEventItems(this.props.user._id);
                  });
              });
            }
          },
        ]
      }),
    }
  }

  authorizeCalendar(){
    if(this.props.canEdit) return;
    this.setState({
      timeRangeSelectedHandling: "Disabled",
      eventClickHandling: "Disabled",
      eventRightClickHandling: "Disabled",
      eventMoveHandling: "Disabled",
      eventResizeHandling: "Disabled",
    })
  }

  fetchEventItems(userId) {
    //getEventItems(this.context.authenticatedUser._id).then((response) => {
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
      let properEvents = this.state.events.concat(events);
      this.setState({
        events: properEvents
      });
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
    if(this.props.user){
      this.fetchEventItems(this.props.user._id);
    } else if (this.props.users){
      this.setState({
        events:[]
      })
      for (let userId of this.props.users) {
        this.fetchEventItems(userId);
      }
    }
  }
  componentWillReceiveProps(){
    this.setState({
      events:[]
    })
    for (let userId of this.props.users) {
      this.fetchEventItems(userId);
    }
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
          //this.fetchEventItems(this.props.user._id);
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
          this.fetchEventItems(this.props.user._id);
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