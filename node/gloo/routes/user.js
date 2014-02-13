
/*
 * GET home page.
 */

'use strict';

var model = require('../model/model.js');
var validator = require('validator');
var revalidator = require('revalidator');
var crypto = require('crypto');

exports.validate_user = function () {
  // Set up our request schema for users
  var schema = {
    properties: {
      usrname: {
        description: 'Validation du champ du nom d\'utilisateur',
        type: 'string',
        pattern: /^[-\sa-zA-Z0-9àçèéêëîïôùû]+$/,
        minLength: 3,
        maxLength: 16,
        required: true,
        messages: {
          required: 'Spécifiez le nom de l\'utilisateur !',
          pattern: 'Certains caractères ne sont pas autorisés dans le nom de l\'utilisateur !',
          minLength: 'Le nom de l\'utilisateur n\'est pas suffisamment explicite ! Minimum 3 lettres.',
          maxLength: 'Limitez le nom de l\'utilisateur à 16 caractères !'
        }
      },
      usruid: {
        description: 'validation du champ UID',
        required: true,
        messages: {
          required: 'Indiquez un uid pour l\'utilisateur !'
        }
      },
      usrhomedir: {
        description: 'validation du champ home directory',
        type: 'string',
        pattern: /^[-\sa-zA-Z0-9àçèéêëîïôùû\/]+$/,
        maxLength: 255,
        required: true,
        messages: {
          pattern: 'Certains caractères ne sont pas autorisés pour le home directory !',
          maxLength: 'Limitez le home directory à 255 caractères !',
          required: 'Indiquez le home directory de l\'utilisateur !'
        }
      },
      usrshell: {
        description: 'validation du shell utilisateur',
        type: 'string',
        pattern: /^[-\sa-zA-Z0-9àçèéêëîïôùû\/]+$/,
        maxLength: 16,
        required: true,
        messages: {
          pattern: 'Certains caractères ne sont pas autorisés pour le shell !',
          maxLength: 'Limitez le shell à 16 caractères !',
          required: 'Indiquez le shell de l\'utilisateur !'
        }
      },
    }
  };
  return schema;
};

exports.list = function (req, res, next) {
  model.getUsers(function (err, users) {
    if (err) {
      next(err);
      return;
    }
    res.send(users);
  });
};

exports.index = function (req, res, next) {
  res.format({
    'text/html': function () {
      res.render('users');
    },
    'application/json': function () {
      exports.list(req, res, next);
    }
  });
};

exports.adduser = function (req, res, next) {
  //console.log('\nNew user: ' + req.body.name);
  var usrpwd = crypto.createHash('md5').update(req.body.pwd).digest('hex');
  var date = new Date();
  var obj = {};
  obj.usrname = validator.trim(req.body.name);
  obj.usruid = validator.trim(req.body.uid);
  obj.usrhomedir = validator.trim(req.body.homedir);
  obj.usrshell = validator.trim(req.body.shell);

  var schema = exports.validate_user();
  var validation = revalidator.validate(obj, schema);
  if (!validation.valid) {
    res.send(validation);
    return;
  } else {
    model.addUser({
      userid: req.body.name,
      passwd: usrpwd,
      uid: req.body.uid,
      gid: req.body.grp,
      homedir: req.body.homedir,
      shell: req.body.shell,
      count: 0,
      accessed: '',
      modified: date,
      LoginAllowed: true
    }, function (err, usr) {
      if (err) {
        next(err);
        return;
      }
      res.send(usr);
    });
  }
};

exports.deleteuser = function (req, res, next) {
  //console.log('ID du user à supprimer: ' + req.params.id);
  model.delUser(req.params.id, function (err, usr) {
    if (err) {
      next(err);
      return;
    }
    res.send(usr);
  });
};

exports.edituser = function (req, res, next) {
  //console.log('USER to edit: ' + req.params.id);
  var editDate = new Date();
  var obj = {};
  obj.usrname = validator.trim(req.body.name);
  obj.usruid = validator.trim(req.body.uid);
  obj.usrhomedir = validator.trim(req.body.homedir);
  obj.usrshell = validator.trim(req.body.shell);

  if (req.body.pwd) {
    var usrpwd = crypto.createHash('md5').update(req.body.pwd).digest('hex');

    var schema = exports.validate_user();
    var validation = revalidator.validate(obj, schema);
    if (!validation.valid) {
      res.send(validation);
      return;
    } else {
      model.editUser(req.params.id, {
        userid: req.body.name,
        passwd: usrpwd,
        uid: req.body.uid,
        gid: req.body.grp,
        homedir: req.body.homedir,
        shell: req.body.shell,
        count: 0,
        accessed: '',
        modified: editDate,
        LoginAllowed: true
      }, function (err, user) {
        if (err) {
          next(err);
          return;
        }
        res.send(user);
      });
    }
  } else {
    var schema = exports.validate_user();
    var validation = revalidator.validate(obj, schema);
    if (!validation.valid) {
      res.send(validation);
      return;
    } else {
      model.editUser(req.params.id, {
        userid: req.body.name,
        uid: req.body.uid,
        gid: req.body.grp,
        homedir: req.body.homedir,
        shell: req.body.shell,
        count: 0,
        accessed: '',
        modified: editDate,
        LoginAllowed: true
      }, function (err, user) {
        if (err) {
          next(err);
          return;
        }
        res.send(user);
      });
    }
  }
};