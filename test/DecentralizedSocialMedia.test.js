const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("DecentralizedSocialMedia Contract", function () {
    let contract;
    let owner;
    let user1;
    let user2;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();

        const DecentralizedSocialMedia = await ethers.getContractFactory("DecentralizedSocialMedia");
        contract = await DecentralizedSocialMedia.deploy();
        await contract.waitForDeployment();
    });

    describe("User Registration", function () {
        it("Should register a new user", async function () {
            await contract.connect(user1).registerUser(
                "Alice",
                "QmTestHash123",
                "female"
            );

            const user = await contract.getUser(user1.address);
            expect(user.name).to.equal("Alice");
            expect(user.walletAddress).to.equal(user1.address);
            expect(user.exists).to.be.true;
        });

        it("Should fail if user already registered", async function () {
            await contract.connect(user1).registerUser("Alice", "QmTestHash123", "female");

            await expect(
                contract.connect(user1).registerUser("Alice Again", "QmTestHash456", "female")
            ).to.be.revertedWith("User already registered");
        });

        it("Should increment user count", async function () {
            await contract.connect(user1).registerUser("Alice", "QmTestHash123", "female");
            await contract.connect(user2).registerUser("Bob", "QmTestHash456", "male");

            expect(await contract.userCount()).to.equal(2);
        });
    });

    describe("Posts", function () {
        beforeEach(async function () {
            await contract.connect(user1).registerUser("Alice", "QmTestHash123", "female");
        });

        it("Should create a new post", async function () {
            await contract.connect(user1).createPost(
                "My first post!",
                "QmPostHash123",
                "image"
            );

            const post = await contract.getPost(1);
            expect(post.caption).to.equal("My first post!");
            expect(post.owner).to.equal(user1.address);
            expect(post.exists).to.be.true;
        });

        it("Should increment post count", async function () {
            await contract.connect(user1).createPost("Post 1", "QmHash1", "image");
            await contract.connect(user1).createPost("Post 2", "QmHash2", "image");

            expect(await contract.postCount()).to.equal(2);
        });

        it("Should fail if non-registered user tries to post", async function () {
            await expect(
                contract.connect(user2).createPost("Post", "QmHash", "image")
            ).to.be.revertedWith("User does not exist");
        });
    });

    describe("Likes", function () {
        beforeEach(async function () {
            await contract.connect(user1).registerUser("Alice", "QmTestHash123", "female");
            await contract.connect(user2).registerUser("Bob", "QmTestHash456", "male");
            await contract.connect(user1).createPost("Test Post", "QmPostHash", "image");
        });

        it("Should like a post", async function () {
            await contract.connect(user2).toggleLike(1);

            const post = await contract.getPost(1);
            expect(post.likeCount).to.equal(1);

            const hasLiked = await contract.hasLiked(1, user2.address);
            expect(hasLiked).to.be.true;
        });

        it("Should unlike a post", async function () {
            await contract.connect(user2).toggleLike(1);
            await contract.connect(user2).toggleLike(1);

            const post = await contract.getPost(1);
            expect(post.likeCount).to.equal(0);
        });
    });

    describe("Comments", function () {
        beforeEach(async function () {
            await contract.connect(user1).registerUser("Alice", "QmTestHash123", "female");
            await contract.connect(user2).registerUser("Bob", "QmTestHash456", "male");
            await contract.connect(user1).createPost("Test Post", "QmPostHash", "image");
        });

        it("Should add a comment", async function () {
            await contract.connect(user2).addComment(1, "Nice post!");

            const post = await contract.getPost(1);
            expect(post.commentCount).to.equal(1);

            const comments = await contract.getPostComments(1);
            expect(comments.length).to.equal(1);
            expect(comments[0].text).to.equal("Nice post!");
        });

        it("Should fail with empty comment", async function () {
            await expect(
                contract.connect(user2).addComment(1, "")
            ).to.be.revertedWith("Comment cannot be empty");
        });
    });

    describe("Follow System", function () {
        beforeEach(async function () {
            await contract.connect(user1).registerUser("Alice", "QmTestHash123", "female");
            await contract.connect(user2).registerUser("Bob", "QmTestHash456", "male");
        });

        it("Should follow a user", async function () {
            await contract.connect(user1).toggleFollow(user2.address);

            const isFollowing = await contract.checkFollowing(user1.address, user2.address);
            expect(isFollowing).to.be.true;

            const alice = await contract.getUser(user1.address);
            const bob = await contract.getUser(user2.address);

            expect(alice.followingCount).to.equal(1);
            expect(bob.followerCount).to.equal(1);
        });

        it("Should unfollow a user", async function () {
            await contract.connect(user1).toggleFollow(user2.address);
            await contract.connect(user1).toggleFollow(user2.address);

            const isFollowing = await contract.checkFollowing(user1.address, user2.address);
            expect(isFollowing).to.be.false;
        });

        it("Should fail when trying to follow yourself", async function () {
            await expect(
                contract.connect(user1).toggleFollow(user1.address)
            ).to.be.revertedWith("Cannot follow yourself");
        });
    });

    describe("Contract Stats", function () {
        it("Should return correct stats", async function () {
            await contract.connect(user1).registerUser("Alice", "QmTestHash123", "female");
            await contract.connect(user1).createPost("Post 1", "QmHash1", "image");
            await contract.connect(user1).addComment(1, "Comment");

            const [userCount, postCount, commentCount] = await contract.getContractStats();

            expect(userCount).to.equal(1);
            expect(postCount).to.equal(1);
            expect(commentCount).to.equal(1);
        });
    });
});
