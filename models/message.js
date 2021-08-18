/** Message class for message.ly */

const db = require("../db");
const ExpressError = require("../expressError");

/** Message on the site. */

class Message {

  /** register new message -- returns
   *    {id, from_username, to_username, body, sent_at}
   */

  static async create({from_username, to_username, body}) {
    const result = await db.query(
        `INSERT INTO messages (
              from_username,
              to_username,
              body,
              sent_at)
            VALUES ($1, $2, $3, current_timestamp)
            RETURNING id, from_username, to_username, body, sent_at`,
        [from_username, to_username, body]);

    return result.rows[0];
  }

  /** Update read_at for message */

  static async markRead(id) {
    const result = await db.query(
        `UPDATE messages
           SET read_at = current_timestamp
           WHERE id = $1
           RETURNING id, read_at`,
        [id]);

    if (!result.rows[0]) {
      throw new ExpressError(`No such message: ${id}`, 404);
    }

    return result.rows[0];
  }

  /** Get: get message by id
   *
   * returns {id, from_user, to_user, body, sent_at, read_at}
   *
   * both to_user and from_user = {username, first_name, last_name, phone}
   *
   */

  static async get(id) {
    const result = await db.query(
        `SELECT m.id,
                m.from_username,
                f.first_name AS from_first_name,
                f.last_name AS from_last_name,
                f.phone AS from_phone,
                m.to_username,
                t.first_name AS to_first_name,
                t.last_name AS to_last_name,
                t.phone AS to_phone,
                m.body,
                m.sent_at,
                m.read_at
          FROM messages AS m
            JOIN users AS f ON m.from_username = f.username
            JOIN users AS t ON m.to_username = t.username
          WHERE m.id = $1`,
        [id]);

    let msg = result.rows[0];

    if (!msg) {
      throw new ExpressError(`No such message: ${id}`, 404);
    }

    return {
      id: msg.id,
      from_user: {
        username: msg.from_username,
        first_name: msg.from_first_name,
        last_name: msg.from_last_name,
        phone: msg.from_phone,
      },
      to_user: {
        username: msg.to_username,
        first_name: msg.to_first_name,
        last_name: msg.to_last_name,
        phone: msg.to_phone,
      },
      body: msg.body,
      sent_at: msg.sent_at,
      read_at: msg.read_at,
    };
  }
}


module.exports = Message;