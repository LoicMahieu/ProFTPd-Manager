/*
 *  TEST
 */

'use strict';

var request = require('supertest');
var expect = require('chai').expect;

var mysqlConfig = {
  host     : '127.0.0.1',
  user     : 'root',
  password : '',
  database : 'proftpd',
  charset  : 'utf8'
};

var app = require('../app')({
  model: {
    client: 'mysql',
    connection: mysqlConfig,
    debug: true
  }
});

before(function (done) {
  require('./fixtures/import-test-records')(mysqlConfig, done);
});

describe('GET /users', function () {
  it('Should return all users in json', function (done) {
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, function (err) {
        if (err) {
          return done(err);
        }
        done();
      });
  });

  it('Should return all users in html', function (done) {
    request(app)
      .get('/users')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });
});

describe('GET /groups', function () {
  it('Should return all groups in html', function (done) {
    request(app)
      .get('/groups')
      .set('Accept', 'text/html')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });

  it('Should return all groups in json', function (done) {
    request(app)
      .get('/groups')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200, function (err) {
        if (err) {
          return done(err);
        }
        done();
      });
  });
});

describe('POST /groups', function () {

  it('Should be 200 OK', function (done) {
    request(app)
      .post('/groups')
      .expect(200, done);
  });

  it('Should not add group because of duplicate id', function (done) {
    request(app)
      .post('/groups')
      .send({
        'nameGrp' : 'NewGroup',
        'idGroup' : '5500',
        'membGrp' : ''
      })
      .expect('{\n  "dup": "Ce Gid existe déjà !"\n}', done);
  });

  it('Should add group', function (done) {
    request(app)
      .post('/groups')
      .send({
        'nameGrp' : 'TestGroup',
        'idGroup' : '5561',
        'membGrp' : 'test'
      })
      .expect(200, done);
  });

});

describe('POST /users', function () {

  it('Should not add a user because of missing args', function (done) {
    request(app)
      .post('/users')
      .send({
        'pwd' : 'azerty'
      })
      .expect(200, done);
  });

  it('Should add new user', function (done) {
    request(app)
      .post('/users')
      .send({
        'name': 'test',
        'pwd': 't3sT',
        'uid': '0',
        'grp': '5503',
        'homedir': '/test/test',
        'shell': '/usr/bin/zsh'
      })
      .expect(200, done);
  });

});

describe('DELETE /groups', function () {

  after(function (done) {
    request(app)
      .post('/groups')
      .send({
        'nameGrp' : 'TestGroup2',
        'idGroup' : '5531',
        'membGrp' : 'essai'
      })
      .end(done);
  });

  it('Should erase a group by id', function (done) {
    request(app)
      .del('/groups/' + 5531)
      .expect('true', done);
  });

  it('Should not erase a group because of wrong args', function (done) {
    request(app)
      .del('/groups/' + 0)
      .expect('false', done);
  });

});

describe('PUT /groups', function () {

  it('Should edit a group by id', function (done) {
    request(app)
      .put('/groups/' + 5530)
      .send({
        'nameGrp' : 'TestGroup',
        'idGroup' : 5530,
        'membGrp' : 'edition'
      })
      .expect('{\n  "groupname": "TestGroup",\n  "gid": 5530,\n  "members": "edition"\n}', done);
  });

  it('Should not edit a group because of wrong args', function (done) {
    request(app)
      .put('/groups/' + 0)
      .send({
        'nameGrp' : 'badEdit',
        'idGroup' : 0,
        'membGrp' : 'edi'
      })
      .expect('false', done);
  });

  it('Should not edit a group because of bad characters', function (done) {
    request(app)
      .put('/groups/' + 5531)
      .send({
        'nameGrp' : 'b@d&dit',
        'idGroup' : 5531,
        'membGrp' : '&dî'
      })
      .expect('{\n  "valid": false,\n  "errors": [\n    {\n      "attribute": "pattern",\n      "property": "grpname",\n      "expected": {},\n      "actual": "b@d&dit",\n      "message": "Certains caractères ne sont pas autorisés !"\n    },\n    {\n      "attribute": "pattern",\n      "property": "grpmember",\n      "expected": {},\n      "actual": "&dî",\n      "message": "Certains caractères ne sont pas autorisés !"\n    }\n  ]\n}', done);
  });

});

var lastRecord = 108;

describe('DELETE /users', function () {

  // after(function () {
  //   console.log('AFTER ERASING A USER');
  //   lastRecord++;
  //   console.log('CURRENT ID: ', lastRecord);
  // });

  // it('Should erase a user by id', function (done) {
  //   request(app)
  //     .del('/users/' + lastRecord)
  //     .expect('true', done);
  // });

  it('Should not erase a user because of wrong args', function (done) {
    request(app)
      .del('/users/i')
      .expect('false', done);
  });
});

describe('PUT /users', function () {

  it('Should edit a user by id', function (done) {
    request(app)
      .put('/users/' + lastRecord)
      .send({
        'name': 'ModifPUT',
        'pwd': 't3sT',
        'uid': '0',
        'grp': '5503',
        'homedir': '/test/test',
        'shell': '/usr/bin/zsh'
      })
      .expect('false', done);
  });

  it('Should not edit a user because of wrong args', function (done) {
    request(app)
      .put('/users/i')
      .send({
        'name': 'wrongArgs',
        'pwd': 't3sT',
        'uid': '0',
        'grp': '5503',
        'homedir': '/test/args',
        'shell': '/usr/bin/zsh'
      })
      .expect('false', done);
  });

  it('Should not edit a user because of bad characters', function (done) {
    request(app)
      .put('/users/' + lastRecord)
      .send({
        'name': '@rg$',
        'pwd': 't3sT',
        'uid': '0',
        'grp': '5503',
        'homedir': '/test/@rg$',
        'shell': '/usr/bin/zsh'
      })
      .expect('{\n  "valid": false,\n  "errors": [\n    {\n      "attribute": "pattern",\n      "property": "usrname",\n      "expected": {},\n      "actual": "@rg$",\n      "message": "Certains caractères ne sont pas autorisés dans le nom de l\'utilisateur !"\n    },\n    {\n      "attribute": "pattern",\n      "property": "usrhomedir",\n      "expected": {},\n      "actual": "/test/@rg$",\n      "message": "Certains caractères ne sont pas autorisés pour le home directory !"\n    }\n  ]\n}', done);
  });

  it('Should edit a user without password change', function (done) {
    request(app)
      .put('/users/' + 109)
      .send({
        'name': 'cover',
        'uid': '0',
        'grp': '5503',
        'homedir': '/test/cover',
        'shell': '/usr/bin/zsh'
      })
      .expect(200)
      .end(function (err, res) {
        if (err) {
          return done(err);
        }

        // Difficult to known extact modified date, so set it to null for test
        res.body.modified = null;

        expect(res.body).deep.equals({ id: 109,
          userid: 'cover',
          uid: '0',
          gid: '5503',
          homedir: '/test/cover',
          shell: '/usr/bin/zsh',
          count: 0,
          accessed: '',
          LoginAllowed: true,
          modified: null
        });

        done();
      });
  });
});