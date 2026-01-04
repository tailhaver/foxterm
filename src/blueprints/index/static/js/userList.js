import Window from "./window.js"

DataTable.ext.errMode = 'none';

function getPerm(raw, id) {
    return `<input type="checkbox"${(raw & id) > 0 ? " checked" : ""} disabled>`;
}

export default class UserListDisplay {
  constructor(pos = [24, 24], size = [738, 457]) {
    this.window = new Window(pos, size);
    this.window.setTitle("admin - users");
    $(this.window.self).resizable({
      handles: "all",
      containment: "parent"
    });
    let $table = $("<table>");
    let $thead = $("<thead>");
    let $tr = $("<tr>");
    for (const e of ['id', 'login', 'perms', 'admin', 'view users', 'modify users', 'upload images']) {
        $tr.append(`<th>${e}</th>`);
    }
    $table.append($thead.append($tr))
    $(this.window.body).html($table);
    $table.on('dt-error.dt', (e, settings, techNote, msg) => {
        $(this.window.body).html("An error occurred trying to list users! Are you allowed to access this?");
    }).DataTable({
        serverSide: true,
        ajax: 'admin/users-source',
        columns: [
            { searchable: false, width: '1px' }, null, { searchable: false, width: '1px' },
            { searchable: false, width: '1px', render: (_, _2, row, _3) => {return getPerm(row[2], 2)} },
            { searchable: false, width: '1px', render: (_, _2, row, _3) => {return getPerm(row[3], 4)} },
            { searchable: false, width: '1px', render: (_, _2, row, _3) => {return getPerm(row[3], 8)} },
            { searchable: false, width: '1px', render: (_, _2, row, _3) => {return getPerm(row[3], 16)} }
        ]
    })
  }
}