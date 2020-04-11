import React, { useEffect } from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import { getFriends } from '../../../services/FriendService';
import { getUser } from '../../../services/UserService';
import { withRouter } from "react-router-dom";

const FriendsDialog = (props) => {
    const [friendList, setFriendList] = React.useState([]);
    const [friendsHidden, setFriendsHidden] = React.useState(false);
    const handleSelectFriend = userId => {
      props.handleSelectFriend(userId);
      props.history.push(`/home/profile/${userId}`);
      props.handleClose();
    }
    const fetchFriends = (userId) => {
      setFriendList([]);
      getFriends(userId).then(
          (response) => {
              if(response.data.friends) response.data.friends.forEach(
                  (item) => {
                      const friendId = item.Userid;
                      getUser(friendId).then(
                          (res) => {
                              const user = res.data;
                              setFriendList(friendList=>friendList.concat([{
                                id: user._id,
                                firstName: user.firstname,
                                lastName: user.lastname,
                                username: user.username
                              }]));
                           }
                      )
                  }
              );
          }
      ).catch(error => {
        if(error.response.status === 403) setFriendsHidden(true);
      });
    }
    useEffect(() => {
      if (!props.open) return;
      if(props.userId) {
        fetchFriends(props.userId);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.open, props.user]);

    const friends = friendList;
    const friendItems = !friends ? [] : friends.map((user) => (
        <ListItem key={user.id} button divider onClick={()=>handleSelectFriend(user.id)}>
            <ListItemAvatar>
                <Avatar src={`${process.env.REACT_APP_API_URL}/api/users/${user.id}/pfp`}>{user.firstName.charAt(0).toUpperCase()}</Avatar>
            </ListItemAvatar>
            <ListItemText 
                primary={`${user.firstName}  ${user.lastName}`}
                secondary={user.username}
            >
            </ListItemText>
        </ListItem>
    ))
  return (
    props.open &&
    <div>
      <Dialog disableBackdropClick open={props.open} onClose={props.handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">Friends </DialogTitle>
        <DialogContent>
          <List>
            {friendsHidden ? "This user's friend list is hidden" : friendItems }
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={props.handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default withRouter(FriendsDialog);