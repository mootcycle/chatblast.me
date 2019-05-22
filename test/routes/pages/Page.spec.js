const Page = require('../../../routes/pages/Page').Route;
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const t = require('../../shortcuts').get(lab);

t.describe('Page', () => {
  let page;

  t.beforeEach((done) => {
    page = new Page({
      route: () => {},
    }, {});

    done();
  });

  t.it('sets the navigation items', (done) => {
    t.expect(page.pageData.navItems.length).to.equal(0);
    done();
  });

  t.it('clones pageData', (done) => {
    const secondPage = new Page({
      route: () => {},
    }, {});

    page.method = 'GET';
    page.path = '/path';

    secondPage.method = 'GET';
    secondPage.path = '/path2';

    page.route();
    secondPage.route();

    secondPage.pageData.navItems.push({});

    t.expect(page.pageData.navItems.length).to.equal(0);
    t.expect(secondPage.pageData.navItems.length).to.equal(1);
    done();
  });
});
