class Admin {
  static get fields() {
    return [
      'email',  // text PRIMARY KEY
      'member_admin',  // bool NOT NULL DEFAULT false
      'hugo_admin',  // bool NOT NULL DEFAULT false
      'admin_admin',  // bool NOT NULL DEFAULT false
      'raami_admin'  // bool NOT NULL DEFAULT false
    ];
  }

  static get roleFields() {
    return [ 'member_admin', 'hugo_admin', 'admin_admin', 'raami_admin' ];
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
    this.hugo_admin = false;
    this.admin_admin = false;
    this.raami_admin = false;
  }
}

module.exports = Admin;
