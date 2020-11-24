export default class Likes {
    constructor () {
        this.likes = [];
    }

    addLike(id, title, author, img) {
        const like = {id, title, author, img};
        this.likes.push(like);

        this.localData();

        return like;
    }

    deleteLike(id) {
        const index = this.likes.findIndex(el => el.id === id);
        this.likes.splice(index, 1);

        this.localData();
    }

    isLiked(id) {
        return this.likes.findIndex(el => el.id === id) !== -1;
    }

    getTotalLikes() {
        return this.likes.length;
    }

    localData() {
        localStorage.setItem("likes", JSON.stringify(this.likes));
    }

    readStorage() {
        const storage = JSON.parse(localStorage.getItem("likes"));
        
        // Restoring likes from the localStorage
        if (storage) this.likes = storage;

    }
};