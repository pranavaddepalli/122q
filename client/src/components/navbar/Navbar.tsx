import React, {useState, useEffect, useContext} from 'react';
import {useCookies} from 'react-cookie';
import {
  useMediaQuery, AppBar, Toolbar, Box, Button, MenuItem, Menu,
  IconButton, Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {styled, useTheme} from '@mui/material/styles';

import OHQueueHeader from './OHQueueHeader';
import ChangeNameBtn from './ChangeNameBtn';
import GoogleLogin from '../common/GoogleLogin';
import AlertOnLogout from './dialogs/AlertOnLogout';

import HomeService from '../../services/HomeService';
import {UserDataContext} from '../../contexts/UserDataContext';
import {QueueDataContext} from '../../contexts/QueueDataContext';
import {StudentDataContext} from '../../contexts/StudentDataContext';
import { NotificationsActive } from '@mui/icons-material';

function createPage(page, link) {
  return {page, link};
}

const NavbarButton = styled(Button)({
  disableElevation: true,
  variant: 'subtitle2',
  color: '#FFFFFF',
  backgroundColor: 'transparent',
});

export default function Navbar(props) {
  const {isHome} = props;
  const theme = useTheme();

  const {queueData} = useContext(QueueDataContext);

  const {studentData} = useContext(StudentDataContext);
  const {userData} = useContext(UserDataContext);

  const isMobileView = useMediaQuery('(max-width: 1000px)');

  const [, , removeCookie] = useCookies(['user']);

  const [pages, setPages] = useState([]);

  const [anchorElNav, setAnchorElNav] = useState(null);

  const [alertOpen, setAlertOpen] = useState(false);
  const [pname, setpname] = useState(userData.preferredName);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const goToPage = (pageLink) => () => {
    window.location.href = pageLink;
  };

  useEffect(() => {
    const newPages = [];

    if (userData.isAuthenticated && userData.isTA) {
      newPages.push(createPage('Settings', 'settings'));
      newPages.push(createPage('Metrics', 'metrics'));
    }

    setPages(newPages);
  }, [userData.isAuthenticated, userData.isTA]);

  useEffect(() => {
    setpname(userData.preferredName);
  }, [userData.preferredName, setpname]);

  function handleLogout() {
    removeCookie('user');
    window.location.href = '';
  }

  function openAlert() {
    setAlertOpen(true);
  }

  function handleLogoutClicked() {
    if (studentData?.position != null && studentData.position !== -1) {
      openAlert();
    } else {
      handleLogout();
    }
  }

  const freezeQueue = () => {
    HomeService.freezeQueue();
  };

  const unfreezeQueue = () => {
    HomeService.unfreezeQueue();
  };

  const [notificationPermission, setNotificationPermission] = useState(Notification.permission);

  const unfreezeButton = <Button color="secondary" variant="contained" sx={{mx: 2}} onClick={unfreezeQueue}>Unfreeze</Button>;
  const freezeButton = <Button color="secondary" variant="contained" sx={{mx: 2}} onClick={freezeQueue}>Freeze</Button>;

  if (isMobileView) {
    return (
      <AppBar position="static" style={{background: theme.alternateColors.navbar}} enableColorOnDark>
        <Toolbar sx={{display: 'flex space-between'}}>
          {
            ((pages && pages.length > 0) || userData.isAuthenticated) &&
            <Box sx={{flexGrow: 1, display: 'flex'}}>
              <IconButton
                size="large"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon/>
              </IconButton>
              <Menu
                id="navbar-menu"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{display: 'block'}}
              >
                {
                  userData.isTA && isHome && (queueData.queueFrozen ?
                    <MenuItem onClick={unfreezeQueue}>
                      <Typography variant='subtitle2' sx={{mx: 2}}>
                        Unfreeze
                      </Typography>
                    </MenuItem> :
                    <MenuItem onClick={freezeQueue}>
                      <Typography variant='subtitle2' sx={{mx: 2}}>
                        Freeze
                      </Typography>
                    </MenuItem>
                  )
                }
                {
                  notificationPermission !== 'granted' && (
                    <MenuItem onClick={() => Notification.requestPermission((permission) => {
                      setNotificationPermission(permission);
                    })}>
                      <Typography variant='subtitle2' sx={{mx: 2}}>
                        Enable Notifications
                      </Typography>
                    </MenuItem>
                  )
                }
                {
                  pages?.map((page) => (
                    <MenuItem key={page.page} onClick={goToPage(page.link)}>
                      <Typography variant='subtitle2' sx={{mx: 2}}>
                        {page.page}
                      </Typography>
                    </MenuItem>
                  ))
                }
                {
                  userData.isAuthenticated && <ChangeNameBtn mobile={true} pname={pname} setpname={setpname}/>
                }
                {
                  userData.isAuthenticated &&
                    <MenuItem onClick={handleLogoutClicked}>
                      <Typography variant='subtitle2' sx={{mx: 2}}>
                            Logout
                      </Typography>
                    </MenuItem>
                }
              </Menu>
            </Box>
          }

          <Box sx={{flexGrow: 1, display: 'flex'}} >
            <OHQueueHeader/>
          </Box>
          <Box sx={{flexGrow: 0, display: 'flex', justifyContent: 'flex-end'}} >
            {
              !userData.isAuthenticated && <GoogleLogin/>
            }
          </Box>
          <AlertOnLogout isOpen={alertOpen} setOpen={setAlertOpen} handleConfirm={handleLogout}/>
        </Toolbar>
      </AppBar>
    );
  }

  // Desktop view
  return (
    <AppBar position="sticky" enableColorOnDark style={{background: theme.alternateColors.navbar}}>
      <Toolbar sx={{display: 'flex space-between'}}>
        <Box sx={{flexGrow: 1, display: 'flex'}}>
          <OHQueueHeader/>
          {
            userData.isTA && isHome && (queueData.queueFrozen ? unfreezeButton : freezeButton)
          }
          {
            notificationPermission !== 'granted' && (
              <IconButton color="secondary" onClick={() => Notification.requestPermission((permission) => {
                setNotificationPermission(permission);
              })}>
                <NotificationsActive />
              </IconButton>
            )
          }
        </Box>
        <Box sx={{flexGrow: 0, display: 'flex', color: '#FFFFFF'}}>
          {
            userData.isAuthenticated && 'Currently Logged in as ' + pname
          }
        </Box>
        <Box sx={{flexGrow: 0, display: 'flex'}}>
          {
            userData.isAuthenticated && <ChangeNameBtn mobile={false} pname={pname} setpname={setpname}/>
          }
        </Box>

        <Box sx={{flexGrow: 0, display: 'flex'}}>
          {
            pages?.map((page) => (
              <NavbarButton key={page.page} href={page.link}>{page.page}</NavbarButton>
            ))
          }
          {
            userData.isAuthenticated ?
            <NavbarButton onClick={handleLogoutClicked}>Logout</NavbarButton> :
            <GoogleLogin/>
          }
        </Box>
        <AlertOnLogout isOpen={alertOpen} setOpen={setAlertOpen} handleConfirm={handleLogout}/>
      </Toolbar>
    </AppBar>
  );
}
