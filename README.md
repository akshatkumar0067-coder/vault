# Vault 🔐

## Distributed File Storage System

Vault is a simple distributed file storage system that stores uploaded files across multiple storage nodes.

The main goal of Vault is to demonstrate **data redundancy and fault tolerance** using multiple storage nodes.

---

## 🚀 Features

- 📤 Upload files
- 💾 Store files on 3 storage nodes
- 📥 Download files
- 🔄 Automatic failover during download
- 🛡️ Basic file path protection
- 🌐 Simple web interface
- ⚡ Node-based distributed storage demonstration

---

## 🏗️ How Vault Works

When a user uploads a file:

```text
                User
                  |
                  ↓
              Vault Server
                  |
        ┌─────────┼─────────┐
        ↓         ↓         ↓
      Node 1    Node 2    Node 3
     (Primary)  (Backup)  (Backup)