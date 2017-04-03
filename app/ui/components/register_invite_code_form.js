import React, { Component, PropTypes } from 'react';
import $ from 'jquery';
import className from 'classnames';

export default class RegisterVerificationForm extends Component {
  constructor() {
    super();
    this.inviteToken = null;
    this.handleAccPassForm = this.handleAccPassForm.bind(this);
    this.openVerificationWindow = this.openVerificationWindow.bind(this);
    this.clearErrorMsg = this.clearErrorMsg.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.setInvite = this.setInvite.bind(this);
  }

  componentWillMount() {
    const { error, showToaster, setErrorMessage } = this.props;
    let errMsg = null;
    if (Object.keys(error).length > 0) {
      errMsg = window.msl.errorCodeLookup(error.errorCode || 0);
      switch (errMsg) {
        case 'CoreError::RequestTimeout':
          errMsg = 'Request timed out';
          break;
        case 'CoreError::MutationFailure::MutationError::AccountExists':
        case 'CoreError::MutationFailure::MutationError::DataExists':
          errMsg = 'This account is already taken.';
          break;
        default:
          errMsg = errMsg.replace('CoreError::', '');
      }
      setErrorMessage(errMsg);
      showToaster(errMsg, { autoHide: true, error: true });
    }
  }

  componentDidMount() {
   this.setInvite();
  }

  componentDidUpdate() {
    this.setInvite();
  }

  setInvite() {
    const user = ((Object.keys(this.props.user).length > 0) && this.props.user.inviteToken) ?
      this.props.user.inviteToken : '';
    this.inviteToken.value = user;
    this.inviteToken.dispatchEvent(new Event('change', { bubbles: true }));
  }

  handleAccPassForm(e) {
    const inviteToken = this.inviteToken.value.trim();
    if (!inviteToken) {
      return;
    }
    e.preventDefault();

    this.props.stateContinue({
      inviteToken
    });
  }

  clearErrorMsg() {
    if (this.props.errorMsg) {
      this.props.clearErrorMessage();
    }
  }

  handleInputChange(e) {
    if (e.keyCode === 13) {
      return;
    }
    this.clearErrorMsg();
  }

  openVerificationWindow() {
    const self = this;
    const url = 'https://nodejs-sample-163104.appspot.com/';
    const ipc = require('electron').ipcRenderer;
    const BrowserWindow = require('electron').remote.BrowserWindow;
    this.clearErrorMsg();
    try {
      ipc.on('messageFromMain', (event, res) => {
        if (res.err) {
          this.inviteToken.value = '';
          return self.props.setErrorMessage(res.err);
        }
        this.props.setInviteCode(res.invite);
        console.log(`message from main: ${res.invite}`);
        self.inviteToken.value = res.invite;
      });
      let win = new BrowserWindow({width: 750, height: 560, resizable: false});
      // win.webContents.openDevTools();
      // win.on('close', () => {
      //   win = null;
      // });
      win.loadURL(url);
      // win.webContents.on('did-finish-load', () => {
      //   win.show();
      //   win.focus();
      // });
      win.show();
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    const { errorMsg } = this.props;
    const inputGrpClassNames = className(
      'inp-grp',
      'validate-field',
      'light-theme',
      { error: errorMsg }
    );

    return (
      <div className="auth-intro-cnt">
        <h3 className="title">Invitation Token</h3>
        <div className="desc">
          Enter an invitation token or click on the "Claim an invitation" button.
        </div>
        <div className="form-b">
          <form id="inviteTokenForm" className="form" name="inviteTokenForm">
            <div id="inviteToken" className={inputGrpClassNames}>
              <input
                id="inviteToken"
                type="test"
                className="normal-pad"
                ref={c => { this.inviteToken = c; }}
                required="true"
                onChange={this.handleInputChange}
                autoFocus
              />
              <label htmlFor="inviteToken">Invitation Token</label>
              <div className="msg">{errorMsg}</div>
            </div>
            <div className="claim-invite">
              <div className="separator">Or</div>
              <button className="btn" type="button" onClick={e => {
                e.preventDefault();
                this.openVerificationWindow();
              }}>Claim an invitation</button>
            </div>
          </form>
        </div>
        <div className="opt align-btn-box">
          <div className="opt-i lt">
            <button
              type="button lt"
              className="btn"
              name="back"
              onClick={() => {
                this.props.stateBack();
              }}
            >Back</button>
          </div>
          <div className="opt-i">
            <button
              type="submit"
              className="btn"
              name="continue"
              form="inviteTokenForm"
              onClick={this.handleAccPassForm}
            >Continue</button>
          </div>
        </div>
      </div>
    );
  }
}
