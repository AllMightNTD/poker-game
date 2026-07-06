1. Dashboard

Đây là màn hình đầu tiên sau khi login.

Hiển thị realtime:

Online Players
Total Players
Active Tables
Total Hands Today
Total Bets
Total Pot
Total Revenue (Rake)
Withdraw Pending
Deposit Pending
Server Status
Redis Status
API Status
Socket Connected

Chart

Revenue 7 ngày
DAU
MAU
New Users
Bets per Hour
Peak Online

Heatmap

Số lượng người chơi theo giờ
2. User Management
Danh sách người chơi

Hiển thị

Avatar
Username
Email
UID
VIP
Coin
Diamond
Status
Register Time
Last Login
Last IP
Device

Action

View Profile
Edit
Ban
Unban
Mute
Reset Password
Send Mail
Gift Coin
Freeze Balance
User Detail

Thông tin

Basic

Username
Nickname
Email
Phone
Country

Game

Win Rate
Total Hands
Total Bets
Total Rake
Total Profit

Wallet

Coin
Diamond
Bonus

History

Login
Deposit
Withdraw
Game History
Chat History
3. Wallet Management

Quản lý toàn bộ tài sản.

Bao gồm

Coin
Add
Remove
Freeze
Diamond
Add
Remove
Bonus
Promotion
Compensation

Transaction History

Deposit
Withdraw
Transfer
Gift
Refund
4. Deposit

Danh sách

Pending
Success
Failed

Action

Approve

Reject

Manual Verify

Upload chứng từ

5. Withdraw

Danh sách

Pending

Approved

Rejected

Completed

Thông tin

Ngân hàng

Tên tài khoản

Amount

Fee

Reason

OTP Verify

6. Poker Table Management

Đây là module quan trọng nhất.

Danh sách bàn

Hiển thị

Table ID
Blind
Max Player
Current Player
Pot
Status
Dealer
Created Time

Action

Open Table

Close Table

Lock Table

Kick Player

Pause Table

Resume Table

7. Hand History

Cho phép replay toàn bộ hand.

Hiển thị

Hand ID

Players

Cards

Board

Pot

Winner

Time

Action Timeline

Replay

Export JSON

8. Player Session

Realtime

Đang chơi ở bàn nào

Thời gian online

IP

Device

Latency

Ping

Socket ID

Có thể

Kick

Disconnect

Ban Device

9. Tournament

Nếu game có Tournament

CRUD

Buy In

Prize

Blind Structure

Status

Registration

Auto Start

10. Rake Management

Thiết lập

Cash Game

Tournament

VIP Discount

Promotion

Rake Cap

11. Promotion

Banner

Gift Code

Referral

Lucky Spin

Daily Reward

First Deposit

VIP Bonus

12. VIP System

Level

Requirement

Benefit

Multiplier

Cashback

Weekly Reward

Monthly Reward

13. Chat Management

Realtime

Public Chat

Private Chat

Report

Mute

Ban Chat

Delete Message

14. Notification

Push Notification

Ingame Mail

Announcement

Popup

Maintenance Notice

15. CMS

Banner

News

Guide

FAQ

Terms

Privacy

16. Report

Revenue

Player Growth

Retention

ARPU

ARPPU

LTV

Churn

Top Winner

Top Loser

Top Deposit

Top Withdraw

17. Anti Cheat

Đây là module cực kỳ quan trọng.

Detect

Collusion

Chip Dumping

Bot

Multiple Account

VPN

Proxy

Abnormal Win Rate

Multi Device

Flag User

Risk Score

18. Audit Log

Ghi lại toàn bộ hành động Admin.

Ví dụ

Admin A

Update User

Old Value

New Value

Time

IP

Browser

OS

Không được phép xóa.

19. Role & Permission

RBAC

Role

Super Admin
Admin
GM
Moderator
Finance
Support
Developer

Permission

Có thể granular tới từng action.

Ví dụ

Player

View

Edit

Delete

Ban

Gift Coin

Export

20. System Monitor

CPU

RAM

Redis

Database

Socket

API

Worker

BullMQ

Latency

21. Queue Monitor

BullMQ

Pending

Processing

Completed

Failed

Retry

22. Game Config

Cấu hình

Min Buy In

Max Buy In

Blind

Timeout

Auto Fold

Reconnect Time

Animation Speed

Maintenance

23. Bot Management (nếu có)

Bot List

Difficulty

Buy In

Strategy

Enable

Disable

24. Support Ticket

Player tạo ticket

Admin reply

Upload file

Close ticket

Assign staff

25. Security

2FA

Login History

Failed Login

Device

Session

API Key

Whitelist IP

Blacklist IP

26. API Monitor

Danh sách API

Response Time

Status Code

Traffic

Error Rate

27. Error Log

Exception

Stack Trace

API

Player

Table

Time

28. Analytics

Realtime

Retention

Funnels

Conversion

Revenue

Country

Device

OS

29. Scheduler

Cron Job

Reward

Reset Daily

Reset Weekly

Tournament Start

Backup DB

30. Backup

Backup Database

Backup Redis

Restore

Download Backup

31. Admin Profile

Thông tin

Avatar

Change Password

2FA

Login History

Sessions

Kiến trúc Menu gợi ý
Dashboard
│
├── Users
│   ├── Players
│   ├── Wallet
│   ├── VIP
│   ├── Sessions
│   └── Reports
│
├── Game
│   ├── Tables
│   ├── Hand History
│   ├── Tournaments
│   ├── Rake
│   ├── Game Config
│   └── Bots
│
├── Finance
│   ├── Deposits
│   ├── Withdrawals
│   ├── Transactions
│   ├── Promotions
│   └── Compensation
│
├── Community
│   ├── Chat
│   ├── Mail
│   ├── Notifications
│   └── Support Tickets
│
├── Monitoring
│   ├── Online Players
│   ├── Queue
│   ├── API
│   ├── Server
│   ├── Redis
│   └── Error Logs
│
├── Security
│   ├── Anti Cheat
│   ├── Audit Logs
│   ├── Login Logs
│   ├── Devices
│   └── IP Management
│
├── CMS
│   ├── News
│   ├── Banners
│   ├── FAQs
│   └── Announcements
│
└── Settings
    ├── Roles & Permissions
    ├── Scheduler
    ├── Backups
    ├── System Config
    └── Admin Profile