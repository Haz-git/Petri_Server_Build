const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'A user requires a first name!']
    },
    lastName: {
        type: String,
        required: [true, 'A user requires a last name!']
    },
    userName: {
        type: String,
        required: [true, 'Please enter your desired username!'],
        minlength: [4, 'Please create a username greater than 4 characters'],
        maxlength: [15, 'Please create a username less than 15 characters!'],
        unique: [true, 'Sorry, this username has already been taken!'],
    },
    email: {
        type: String,
        required: [true, 'Please enter an email address for your new account!'],
        unique: [true, 'Sorry! Someone else has already registered under this email address!'],
        validate: {
            validator: validator.isEmail,
            message: 'Please input a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Please enter a password!'],
        minlength: [6, 'Please enter a password greater than 6 characters!'],
        maxlength: [20, 'Passwords cannot be over 20 characters'],
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password!'],
        validate: {
            validator: function(passwordConfirmValue) {
                return passwordConfirmValue === this.password
            },
            message: 'Your passwords do not match!'
        }
    },
    taskList: [],
    bionotes: [],
    calendarEvents:[],
    laczAssayProtocols: [],
    notebook: {
        rootFiles: [],
        rootFolders: [],
    },
    profileImg: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
}, { minimize: false });

//Minimize: false should prevent removal of profileImg's empty object.

//Create a pre-save Hook to hash password before save:
userSchema.pre('save', async function(next) {
    //hash the password on save:
    this.password = await bcrypt.hash(this.password, 12);
    //Set passwordConfirm to undefined:
    this.passwordConfirm = undefined;
    next();
})

//Creating instance method for hashing password:
userSchema.methods.comparePasswords = async function(userSubmittedPassword, userPassword) {
    return await bcrypt.compare(userSubmittedPassword, userPassword);
}

//Finds the correct parent folder and injects the child note.
userSchema.methods.injectChildToParent = function (entity, parentId, userNotebook) {
    const targetFolderIdx = userNotebook.rootFolders.findIndex((folder) => {
        if (folder.folderId === parentId) return true;
    });

    if (targetFolderIdx > -1) {
        userNotebook.rootFolders[targetFolderIdx].children.push(entity);
    }

    return userNotebook;

}

userSchema.methods.removeFolderContents = function (folderId, userNotebook) {
    const targetFolderIdx = userNotebook.rootFolders.findIndex((folder) => {
        if (folder.folderId === folderId) return true;
    });

    const targetFolder = userNotebook.rootFolders[targetFolderIdx];

    if (targetFolder.children.length !== 0) {
        targetFolder.children.forEach((child) => {
            let childId = child.noteId === undefined ? child.folderId : child.noteId;
            let childType = child.noteId === undefined ? 'FOLDER' : 'NOTE';

            if (childType === 'FOLDER') {

                let childTargetIdx = userNotebook.rootFolders.findIndex((child) => {
                    if (child.folderId === childId) return true;
                })
                userNotebook.rootFolders.splice(childTargetIdx, 1);
            } else {
                let childTargetIdx = userNotebook.rootFiles.findIndex((child) => {
                    if (child.noteId === childId) return true;
                })
                userNotebook.rootFiles.splice(childTargetIdx, 1);
            }

        });
    }

    return userNotebook;
}

//Find the correct parent and removes the child note
userSchema.methods.removeChildFromParent = function (childId, parentId, userNotebook) {
    const targetFolderIdx = userNotebook.rootFolders.findIndex((folder) => {
        if (folder.folderId === parentId) return true;
    });

    if (targetFolderIdx > -1) {

        const targetChildIdx = userNotebook.rootFolders[targetFolderIdx].children.findIndex((child) => {
            if (child.noteId === childId || child.folderId === childId) {
                return true;
            }
        });

        userNotebook.rootFolders[targetFolderIdx].children.splice(targetChildIdx, 1);
    }

    return userNotebook;


}

//Finds the correct parent and child, modifies the child.
userSchema.methods.editChildOfParent = function (childId, parentId, newEntryName, newEntryVal, userNotebook) {
    const targetFolderIdx = userNotebook.rootFolders.findIndex((folder) => {
        if (folder.folderId === parentId) return true;
    });

    if (targetFolderIdx > -1) {
        const targetChildIdx = userNotebook.rootFolders[targetFolderIdx].children.findIndex((child) => {
            if (child.noteId === childId || child.folderId === childId) {
                return true;
            }
        });


        userNotebook.rootFolders[targetFolderIdx].children[targetChildIdx][newEntryName] = newEntryVal;

        userNotebook.rootFolders[targetFolderIdx].children[targetChildIdx]['dateModified'] = new Date();
    }

    return userNotebook;

}

userSchema.methods.editEntityProperty = function (currentNotebook, entityType, entityId, property, newPropertyValue) {
    if (entityType === 'NOTE') {
        currentNotebook.rootFiles.find(x => x.noteId === entityId)[property] = newPropertyValue;
    } else if (entityType === 'FOLDER') {
        currentNotebook.rootFolders.find(x => x.folderId === entityId)[property] = newPropertyValue;
    }
    return currentNotebook;
}

userSchema.methods.findEntity = (entityId, entityType, notebook, returnType = 'INDEX') => {
    switch (entityType) {
        case ('FOLDER'):
            const locationFolder = notebook.rootFolders.findIndex((folder) => {
                if (folder.folderId === entityId) return true;
            });
            if (returnType === 'INDEX') {
                return locationFolder;
            }
            return notebook.rootFolders[locationFolder];
        case ('NOTE'):
            const locationNote = notebook.rootFiles.findIndex((note) => {
                if (note.noteId === entityId) return true;
            });

            if (returnType === 'INDEX') {
                return locationNote;
            }

            return notebook.rootFiles[locationNote];
        default:
            throw new error('No entity type was specified in findEntity()');
    }
}

//Creating Model:
const User = mongoose.model('User', userSchema);

module.exports = User;