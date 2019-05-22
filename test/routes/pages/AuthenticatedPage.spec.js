const AuthenticatedPage = require('../../../routes/pages/AuthenticatedPage').Route; // eslint-disable-line max-len
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const t = require('../../shortcuts').get(lab);

t.describe('AuthenticatedPage', () => {
  let page;

  t.beforeEach((done) => {
    page = new AuthenticatedPage({}, {});

    done();
  });

  t.it('sets the authentication scheme', (done) => {
    t.expect(page.auth).to.equal('chatblast.me');
    done();
  });

  t.it('sets the navigation items', (done) => {
    t.expect(page.pageData.navItems.length).to.be.greaterThan(1);
    done();
  });
});
