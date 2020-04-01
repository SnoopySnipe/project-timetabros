import React, {Component} from 'react';
import {DayPilot, DayPilotCalendar} from "daypilot-pro-react";
import { getEventItems, createEventItem, deleteEventItem, updateEventItemTime, updateEventItemTitle } from '../../../services/ScheduleService';
import { IconButton } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import Moment from 'react-moment';
import ScheduleDialog from '../ScheduleDialog/ScheduleDialog';
import "./CalendarStyles.css";

// const styles = {
//   left: {
//     float: "left",
//     width: "220px"
//   },
//   main: {
//     marginLeft: "220px"
//   },
//   events: {
//     fontWeight: "bold"
//   }
// };

class Calendar extends Component {
  constructor(props) {
    super(props);
    console.log(this.context);
    this.state = {
      selectedEvent: null,
      openCreateDialog: false,
      createStartDate: null,
      createEndDate: null,
      events: [],
      viewType: "Week",
      durationBarVisible: false,
      timeRangeSelectedHandling: "Enabled",
      headerDateFormat: "dddd MMMM d",
      onTimeRangeSelected: args => {
        let dp = this.calendar;
        this.setState({
          openCreateDialog: true,
          selectedEvent: null,
          createStartDate: args.start.toDate(),
          createEndDate: args.end.toDate()
        })
        dp.clearSelection();
      },
      eventDeleteHandling: "Update",
      onEventDeleted: function (args) {
        this.message("Event deleted: " + args.e.text());
      },
      onEventMoved: args => {
        updateEventItemTime(args.e.data.id, args.newStart.toDate(), args.newEnd.toDate()).then(
          () => {
            this.fetchUsersEventItems();
          }
        );
      },
      onEventClick: args => {
        console.log(args.e.data);
        this.setState({
          openCreateDialog: true,
          selectedEvent: {
            name: args.e.data.text,
            description: args.e.data.description,
            id: args.e.data.id
          },
          createStartDate: args.e.data.start.toDate(),
          createEndDate: args.e.data.end.toDate()
        })
      },
      eventResizeHandling: "Update",
      onEventResized: (args) => {
        updateEventItemTime(args.e.data.id, args.newStart.toDate(), args.newEnd.toDate()).then(
          () => {
            this.fetchUsersEventItems();
          }
        );
      },
      contextMenu: new DayPilot.Menu({
        items: [
          { text: "Delete", onClick: (args) => {
              DayPilot.Modal.confirm("Delete Event?").then((modal) => {
                  if (!modal.result) { return; }
                  deleteEventItem(args.source.data.id).then(() => {
                    args.source.calendar.events.remove(modal);
                    this.fetchUsersEventItems();
                  });
              });
            }
          },
        ]
      }),


      onBeforeEventRender: args => {
        args.data.cssClass = "events";
        args.data.backColor = args.e.colour;
        if (args.e.description) {
          args.data.html = args.e.text + " - <br/>" + args.e.description;
        } else {
          args.data.html = args.e.text + " - <br/> No Description";
        }
      },
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

  handleCloseCreateDialog = () => {
    this.setState({
      openCreateDialog: false
    })
  }
  fetchUsersEventItems = () => {
    this.setState({
      events:[]
    })
    for (let user of this.props.users) {
      this.fetchEventItems(user);
    }
  }
  fetchEventItems = (user) => {
    getEventItems(user.id).then((response) => {      
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
        return {start: start.toISOString(), end: end.toISOString(), text: item.title, id: item.ID, description: item.description, eventMembers: item.eventmembers, colour: user.colour};
      }) : [];
      this.setState({
        events: this.state.events.concat(events)
      });
    })
    // Not sure if we need this
    .catch(error => {
      console.error("userId "+user.id+" does not exist", error);
    });
  }

  componentDidMount() {
    this.setState({
      startDate: (new Date()).toISOString()
    });
    this.authorizeCalendar();
    if (this.props.users){
      console.log(this.props.users);
      this.fetchUsersEventItems();
    }
  }
  componentWillReceiveProps(){
    this.setState({
      events:[]
    })
    for (let user of this.props.users) {
      this.fetchEventItems(user);
    }
  }
  updateWeekEventItems() {

  }

  render() {
    var {...config} = this.state;
    return (
      <div>
        <ScheduleDialog open={this.state.openCreateDialog} handleClose={this.handleCloseCreateDialog} handleCreated={this.fetchUsersEventItems} createStartDate={this.state.createStartDate} createEndDate={this.state.createEndDate} eventToUpdate={this.state.selectedEvent}></ScheduleDialog>
        <IconButton onClick={()=>{
          const date = new Date(this.state.startDate);
          date.setDate(date.getDate() - 7);
          this.setState({startDate: date.toISOString()});
          this.fetchUsersEventItems();
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
          this.fetchUsersEventItems();
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