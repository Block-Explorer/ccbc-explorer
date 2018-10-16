
import chai from 'chai';
import http from 'chai-http';
import server from '../../server';

const expect = chai.expect;
const should = chai.should();

chai.use(http);

describe('API', () => {
  it('/api/address/:hash', (done) => {
    chai.request(server)
      .get('/api/address/SZJxXkgJJJF2oqzF6kkP3c8n7YV4RnA3ag')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/block/hash/:hash', (done) => {
    chai.request(server)
      .get('/api/block/hash/3188ae59a36069c7ae42ed4a800a1c00fb36461851aa0fdbfa4a7289bb9797d2')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/block/height/:height', (done) => {
    chai.request(server)
      .get('/api/block/height/2000')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/coin', (done) => {
    chai.request(server)
      .get('/api/coin')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        if (res.body) {
          res.body.should.be.a('object');
          res.body.blocks.should.be.a('number');
          res.body.btc.should.be.a('number');
          res.body.cap.should.be.a('number');
          res.body.diff.should.be.a('number');
          res.body.mnsOff.should.be.a('number');
          res.body.mnsOn.should.be.a('number');
          res.body.netHash.should.be.a('number');
          res.body.peers.should.be.a('number');
          res.body.status.should.be.a('string');
          res.body.supply.should.be.a('number');
          res.body.usd.should.be.a('number');
        }
        done();
      });
  });

  it('/api/coin/history', (done) => {
    chai.request(server)
      .get('/api/coin/history')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/peer', (done) => {
    chai.request(server)
      .get('/api/peer')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/peer/history', (done) => {
    chai.request(server)
      .get('/api/peer/history')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });

  it('/api/tx/latest', (done) => {
    chai.request(server)
      .get('/api/tx/latest')
      .query({ limit: 1 })
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        res.body.should.be.a('array');
        if (res.body.length) {
          expect(res.body.length).to.gte(1);
        }
        done();
      });
  });

  it('/api/tx/:hash', (done) => {
    chai.request(server)
      .get('/api/tx/3188ae59a36069c7ae42ed4a800a1c00fb36461851aa0fdbfa4a7289bb9797d2')
      .end((err, res) => {
        expect(err).to.be.null;
        res.should.have.status(200);
        done();
      });
  });
});
