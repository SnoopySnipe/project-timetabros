import React, {Component} from 'react';
import {DayPilot, DayPilotCalendar} from "daypilot-pro-react";
import { getEventItems, deleteEventItem, updateEventItemTime} from '../../../services/ScheduleService';
import { IconButton } from '@material-ui/core';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import Moment from 'react-moment';
import moment from 'moment';
import ScheduleDialog from '../ScheduleDialog/ScheduleDialog';
import "./CalendarStyles.css";

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedEvent: null,
      openCreateDialog: false,
      createStartDate: null,
      createEndDate: null,
      events: [],
      users: [],
      viewType: "Week",
      weekStarts: 0,
      dayBeginsHour: 6,
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
        let event = args.e.data;
        event.name = args.e.data.text;
        this.setState({
          openCreateDialog: true,
          selectedEvent: event,
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
      events:[],
      profileHidden: false,
    });
    for (let user of this.state.users) {
      this.fetchEventItems(user);
    }
  }
  fetchEventItems = (user) => {

    getEventItems(user.id).then((response) => {    
      let scheduleItems = response.data.scheduleitems ? response.data.scheduleitems.map((item) => {
        let start = new Date(this.state.startDate);
        let itemStartDate = new Date(item.startdate);
        const itemStartMoment = moment(itemStartDate);
        const scheduleStartMoment = moment(start).day(itemStartMoment.day());
        let startDiff = scheduleStartMoment.week() - itemStartMoment.week();
        itemStartMoment.add(startDiff, 'weeks');

        let end = new Date(this.state.startDate);
        let itemEndDate = new Date(item.enddate);
        const itemEndMoment = moment(itemEndDate);
        const scheduleEndMoment = moment(end).day(itemEndMoment.day());
        let endDiff = scheduleEndMoment.week() - itemEndMoment.week();
        itemEndMoment.add(endDiff, 'weeks');

        return {start: itemStartMoment.toISOString(), end: itemEndMoment.toISOString(), text: item.title, id: item.ID, description: item.description, eventMembers: item.eventmembers, createdby: item.createdby, creatorstatus: item.creatorstatus, iscobalt: item.iscobalt, colour: user.colour};
      }) : [];
      const eventOwnedItems = response.data.eventowneritems ? response.data.eventowneritems.map((item) => {

        let itemStartDate = new Date(item.startdate);
        let itemEndDate = new Date(item.enddate);
        return {start: itemStartDate.toISOString(), end: itemEndDate.toISOString(), text: item.title, id: item.ID, description: item.description, eventMembers: item.eventmembers,  createdby: item.createdby, creatorstatus: item.creatorstatus, iscobalt: item.iscobalt,eventmembers: item.eventmembers, colour: user.colour};
      }) : [];
      const eventMemberItems = response.data.eventmemberitems ? response.data.eventmemberitems.map((item) => {

        let itemStartDate = new Date(item.startdate);
        let itemEndDate = new Date(item.enddate);
        return {start: itemStartDate.toISOString(), end: itemEndDate.toISOString(), text: item.title, id: item.ID, description: item.description, eventMembers: item.eventmembers,  createdby: item.createdby, creatorstatus: item.creatorstatus, iscobalt: item.iscobalt,eventmembers: item.eventmembers, colour: user.colour};
      }) : [];
      const courseItems = response.data.courses ? response.data.courses.map((item) => {
        let start = new Date(this.state.startDate);
        let itemStartDate = new Date(item.startdate);
        const itemStartMoment = moment(itemStartDate);
        const scheduleStartMoment = moment(start).day(itemStartMoment.day());
        let startDiff = scheduleStartMoment.week() - itemStartMoment.week();
        itemStartMoment.add(startDiff, 'weeks');
        let end = new Date(this.state.startDate);
        let itemEndDate = new Date(item.enddate);
        const itemEndMoment = moment(itemEndDate);
        const scheduleEndMoment = moment(end).day(itemEndMoment.day());
        let endDiff = scheduleEndMoment.week() - itemEndMoment.week();
        itemEndMoment.add(endDiff, 'weeks');
        return {start: itemStartMoment.toISOString(), end: itemEndMoment.toISOString(), text: item.title, id: item.ID, description: item.description, eventMembers: item.eventmembers,  createdby: item.createdby, creatorstatus: item.creatorstatus, iscobalt: item.iscobalt,eventmembers: item.eventmembers, colour: user.colour};
      }) : [];
      this.setState({
        events: this.state.events.concat(scheduleItems).concat(eventOwnedItems).concat(eventMemberItems).concat(courseItems)
      });
    })
    // Not sure if we need this
    .catch(error => {
      if(error.response.status === 403 && this.state.users.length === 1) this.setState({profileHidden: true});
    });
  }

  usersEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (var i = 0; i < arr1.length; i++) {
      if(arr1[i].id !== arr2[i].id) return false;
    }
    return true;
  }

  componentDidMount() {
    const startDate = moment();
    if(startDate.hours() >= 20) startDate.subtract(startDate.hours()-20+1, 'hours');
    this.setState({
      startDate: startDate.toISOString()
    });
    this.authorizeCalendar();
    if (this.props.users){
      this.setState({users:this.props.users}, ()=>this.fetchUsersEventItems());  
    }
  }
  componentDidUpdate(prevProps){


    // console.log(prevProps);
    // console.log(this.props.users);
    if(this.props.users && prevProps.users && !this.usersEqual(prevProps.users, this.props.users)) {
      this.setState({users: this.props.users}, ()=>this.fetchUsersEventItems());

    }
  }

  // componentWillUpdate() {
  //   this.fetchUsersEventItems();

  // }
  updateWeekEventItems() {

  }

  render() {
    var {...config} = this.state;
    return (
      <div>
        {
          this.state.profileHidden ?
          <h3 style={{textAlign:'center'}}>Schedule Hidden</h3> :
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
        }
      </div>
    );
  }
}

export default Calendar;