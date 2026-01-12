#!/bin/bash

# データベースをリセットするスクリプト

echo "データベースをリセットします..."

# Dockerコンテナを停止
docker-compose down

# MySQLのボリュームを削除
docker volume rm task_mysql_data 2>/dev/null || echo "ボリュームが存在しないか、既に削除されています"

# コンテナを再起動
docker-compose up -d

echo "データベースのリセットが完了しました。"
echo "バックエンドが起動したら、テーブルが自動的に作成されます。"
