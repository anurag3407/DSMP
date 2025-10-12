// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract UserProfile {
    struct User {
        string username;
        string bio;
        string avatarCID;
        address wallet;
    }

    mapping(address => User) private users;

    event ProfileCreated(address indexed user, string username);
    event ProfileUpdated(address indexed user, string username, string bio);

    modifier onlyRegistered() {
        require(isUserRegistered(msg.sender), "User not registered");
        _;
    }

    function isUserRegistered(address _user) public view returns (bool) {
        return bytes(users[_user].username).length > 0;
    }

    function createProfile(
        string memory _username,
        string memory _bio,
        string memory _avatarCID
    ) external {
        require(!isUserRegistered(msg.sender), "Profile already exists");

        users[msg.sender] = User({
            username: _username,
            bio: _bio,
            avatarCID: _avatarCID,
            wallet: msg.sender
        });

        emit ProfileCreated(msg.sender, _username);
    }

    function updateProfile(
        string memory _username,
        string memory _bio,
        string memory _avatarCID
    ) external onlyRegistered {
        User storage user = users[msg.sender];
        user.username = _username;
        user.bio = _bio;
        user.avatarCID = _avatarCID;

        emit ProfileUpdated(msg.sender, _username, _bio);
    }

    function getProfile(address _user) external view returns (User memory) {
        return users[_user];
    }
}
