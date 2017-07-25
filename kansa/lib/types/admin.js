class Admin {
  static get fields() {
    return [
      'email',  // text PRIMARY KEY
      'member_admin',  // bool NOT NULL DEFAULT false
      'member_list',  // bool NOT NULL DEFAULT false
      'siteselection',  // bool NOT NULL DEFAULT false
      'hugo_admin',  // bool NOT NULL DEFAULT false
      'raami_admin',  // bool NOT NULL DEFAULT false
      'admin_admin',  // bool NOT NULL DEFAULT false
    ];
  }

  static get roleFields() {
    return [ 'member_admin', 'member_list', 'siteselection', 'hugo_admin', 'raami_admin', 'admin_admin' ];
  }

  static get sqlRoles() {
    return Admin.roleFields.join(', ');
  }

  static get sqlValues() {
    const fields = Admin.fields;
    const values = fields.map(fn => `$(${fn})`).join(', ');
    return `(${fields.join(', ')}) VALUES(${values})`;
  }

  constructor(email) {
    this.email = email;
    this.member_admin = false;
    this.member_list = false;
    this.siteselection = false;
    this.hugo_admin = false;
    this.raami_admin = false;
    this.admin_admin = false;
  }
}

module.exports = Admin;
