'use strict';

const electron = require('electron');
const FS = require("fire-fs");
const Path = require("fire-path");
const MainLib = require('./app/dist/main');

global.SDKBOX_CHANEL = 'creator';

module.exports = {
    load: function() {
        electron.globalShortcut.register('f12', () => {
            let win = electron.BrowserWindow.getFocusedWindow();
            if (!win) return;
            win.webContents.toggleDevTools();
        });

        MainLib.sdkboxLoad();
    },

    unload: function() {
        MainLib.sdkboxUnload();
    },

    messages: {
        'launch' () {
            MainLib.LaunchWindow();
        },
        'editor:build-finished': function(event, target) {
            let root = Path.normalize(target.dest);
            //let sdkbox_install_dir = Path.normalize(Path.join(target.dest, '..', 'packages', 'SDKBox-installer'))
            // "jsb-" + target.template
            let dest_config = Path.normalize(Path.join(target.dest, 'res', 'sdkbox_config.json'));
            let backup_config = Path.normalize(Path.join(Editor.projectInfo.path, 'temp', 'SDKBox', 'sdkbox_config.json'));
            FS.readFile(backup_config, "utf8", function(err, data) {
                if (err) {
                    // Editor.log(`SDKBox: read backup config file failed:(${backup_config})`);
                } else {
                    Editor.log('SDKBox: read backup config file successed');
                    FS.writeFile(dest_config, data, function(error) {
                        if (err) {
                            Editor.log(`SDKBox: write config failed:(${dest_config})`);
                        } else {
                            Editor.log('SDKBox: write config successed')
                        }
                    });
                }
            });

            electron.dialog.showMessageBox({
                type: 'info',
                title: 'SDKBox',
                message: 'Install SDKBox Plugin?',
                buttons: ['Yes', 'Later']
            }, function(response) {
                if (0 == response) {
                    MainLib.LaunchWindow();
                }
            })

            MainLib.SendMsgToSDKBoxWin('SDKBox:build-finish');
        },
        'editor:build-start': function(event, target) {
            let root = Path.normalize(target.dest);
            let sdkbox_install_dir = Path.normalize(Path.join(target.dest, '..', 'packages', 'SDKBox-installer'));
            // "jsb-" + target.template
            let url = Path.join(root, 'res', 'sdkbox_config.json');
            FS.readFile(url, 'utf8', (err, data) => {
                if (err) {
                    // Editor.log(`SDKBox: read config file failed:(${url}`);
                } else {
                    Editor.log('SDKBox: read config file successed');
                    let dest = Path.normalize(Path.join(Editor.projectInfo.path, 'temp', 'SDKBox', 'sdkbox_config.json'));
                    FS.mkdirp(Path.dirname(dest), (err) => {
                        if (err) {
                            Editor.log('SDKBox: create sdkbox temp folder failed');
                        } else {
                            FS.writeFile(dest, data, (err) => {
                                if (err) {
                                    Editor.log('SDKBox backup config file failed');
                                } else {
                                    Editor.log('SDKBox: backup config file successed');
                                }
                            })
                        };
                    });
                }
            });
        },
    },
};
