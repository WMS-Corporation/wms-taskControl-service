class Task{
    constructor(codOperator, date, type, status, productList, codTask) {
        this._codOperator = codOperator;
        this._date = date;
        this._type = type;
        this._status = status;
        this._productList = productList;
        this._codTask = codTask;
    }

    get codOperator() {
        return this._codOperator;
    }

    set codOperator(value) {
        this._codOperator = value;
    }

    get date() {
        return this._date;
    }

    set date(value) {
        this._date = value;
    }

    get type() {
        return this._type;
    }

    set type(value) {
        this._type = value;
    }

    get status() {
        return this._status;
    }

    set status(value) {
        this._status = value;
    }

    get productList() {
        return this._productList;
    }

    set productList(value) {
        this._productList = value;
    }

    get codTask() {
        return this._codTask;
    }

    set codTask(value) {
        this._codTask = value;
    }
}

module.exports = {Task}