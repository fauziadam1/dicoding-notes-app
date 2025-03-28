import "./style.css";

class AppBar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<header class="header"><h1><i class='bx bxs-notepad'></i>Notes App</h1></header>`;
  }
}
customElements.define("app-bar", AppBar);

class NoteForm extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <form id="note-form">
        <input type="text" id="title" placeholder="Judul catatan" required />
        <textarea id="body" placeholder="Isi catatan" required></textarea>
        <button type="submit">Tambah Catatan</button>
      </form>
    `;
    this.querySelector("#note-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const title = this.querySelector("#title").value;
      const body = this.querySelector("#body").value;
      document.querySelector("notes-list")?.addNote(title, body);
      this.querySelector("#note-form").reset();
    });
  }
}
customElements.define("note-form", NoteForm);

class NotesList extends HTMLElement {
  constructor() {
    super();
    this.notes = [];
    this.loading = false;
    this.fetchNotes();
  }

  async fetchNotes() {
    try {
      this.loading = true;
      this.render();
      const response = await fetch("https://notes-api.dicoding.dev/v2/notes");
      if (!response.ok) {
        throw new Error("Gagal mengambil data catatan");
      }
      const data = await response.json();
      this.notes = data.data;
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async addNote(title, body) {
    try {
      this.loading = true;
      this.render();
      const response = await fetch("https://notes-api.dicoding.dev/v2/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body }),
      });
      if (!response.ok) {
        throw new Error("Gagal menambahkan catatan");
      }
      await this.fetchNotes();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async archiveNote(id) {
    try {
      this.loading = true;
      this.render();
      const response = await fetch(
        `https://notes-api.dicoding.dev/v2/notes/${id}/archive`,
        {
          method: "POST",
        },
      );
      if (!response.ok) {
        throw new Error("Gagal mengarsipkan catatan");
      }
      await this.fetchNotes();
      document.querySelector("archived-notes")?.fetchArchivedNotes();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async deleteNote(id) {
    try {
      this.loading = true;
      this.render();
      await fetch(`https://notes-api.dicoding.dev/v2/notes/${id}`, {
        method: "DELETE",
      });
      await this.fetchNotes();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      this.loading = false;
      this.render();
    }
  }

  render() {
    if (this.loading) {
      this.innerHTML = `<div class="loader"></div>`;
      return;
    }
    this.innerHTML = this.notes
      .map(
        (note) => `
            <div class="content-list">
                <h3>${note.title}</h3>
                <p>${note.body}</p>
                <button class="archive-btn" data-id="${note.id}">Arsipkan</button>
                <button class="delete-btn" data-id="${note.id}">Hapus</button>
            </div>
        `,
      )
      .join("");

    this.querySelectorAll(".archive-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const noteId = e.target.getAttribute("data-id");
        this.archiveNote(noteId);
      });
    });

    this.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const noteId = e.target.getAttribute("data-id");
        this.deleteNote(noteId);
      });
    });
  }
}
customElements.define("notes-list", NotesList);

class ArchivedNotes extends HTMLElement {
  constructor() {
    super();
    this.notes = [];
    this.loading = false;
    this.fetchArchivedNotes();
  }

  async fetchArchivedNotes() {
    try {
      const response = await fetch(
        "https://notes-api.dicoding.dev/v2/notes/archived",
      );
      if (!response.ok) {
        throw new Error("Gagal mengambil catatan yang diarsipkan");
      }
      const data = await response.json();
      this.notes = data.data;
      this.render();
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  async unarchiveNote(id) {
    try {
      await this._toggleLoading(true);
      await this._unarchiveNote(id);
      await this._refreshNotes();
    } catch (error) {
      this._handleError(error);
    } finally {
      await this._toggleLoading(false);
    }
  }

  async deleteArchivedNote(id) {
    try {
      await this._toggleLoading(true);
      await this._deleteNote(id);
      await this._refreshArchivedNotes();
    } catch (error) {
      this._handleError(error);
    } finally {
      await this._toggleLoading(false);
    }
  }

  async _toggleLoading(isLoading) {
    this.loading = isLoading;
    this.render();
  }

  async _unarchiveNote(id) {
    try {
      const response = await fetch(
        `https://notes-api.dicoding.dev/v2/notes/${id}/unarchive`,
        { method: "POST" },
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      await this.fetchArchivedNotes();
      document.querySelector("notes-list")?.fetchNotes();
    } catch (error) {
      throw error;
    }
  }

  async _deleteNote(id) {
    try {
      this.loading = true;
      this.render();
      const response = await fetch(
        `https://notes-api.dicoding.dev/v2/notes/${id}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      await this.fetchArchivedNotes();
    } catch (error) {
      throw error;
    } finally {
      this.loading = false;
      this.render();
    }
  }

  async _refreshNotes() {
    
  }

  async _refreshArchivedNotes() {
    
  }

  _handleError(error) {
    alert(`Error: ${error.message}`);
  }

  render() {
    if (this.loading) {
      this.innerHTML = `<div class="loader"></div>`;
      return;
    }
    this.innerHTML = `<h2>Arsip</h2>
    <div class="content-arsip">
      ${this.notes
        .map(
          (note) => `
          <div class="content-list">
              <h3>${note.title}</h3>
              <p>${note.body}</p>
              <button class="unarchive-btn" data-id="${note.id}">Batalkan Arsip</button>
              <button class="delete-archive-btn" data-id="${note.id}">Hapus</button>
          </div>
      `,
        )
        .join("")}
    </div>`;

    this.querySelectorAll(".unarchive-btn").forEach((button) => {
      button.addEventListener("click", async (e) => {
        const noteId = e.target.getAttribute("data-id");
        await this.unarchiveNote(noteId);
      });
    });

    this.querySelectorAll(".delete-archive-btn").forEach((button) => {
      button.addEventListener("click", (e) => {
        const noteId = e.target.getAttribute("data-id");
        this.deleteArchivedNote(noteId);
      });
    });
  }
}
customElements.define("archived-notes", ArchivedNotes);

document.addEventListener("DOMContentLoaded", () => {
  const archivedSection = document.createElement("archived-notes");
  document.body.appendChild(archivedSection);
  archivedSection.fetchArchivedNotes();
});
