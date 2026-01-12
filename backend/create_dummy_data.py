#!/usr/bin/env python3
"""
ダミーデータ作成スクリプト

使用方法:
    python create_dummy_data.py [日付]

例:
    python create_dummy_data.py 2024-01-01
    日付を指定しない場合は今日の日付が使用されます
"""

import sys
import os
from datetime import date, datetime

# プロジェクトのルートディレクトリをパスに追加
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import requests

def create_dummy_data(target_date: str = None):
    """ダミーデータを作成"""
    if target_date is None:
        target_date = date.today().isoformat()
    
    api_url = "http://localhost:8000/api/v1/tasks/dummy-data"
    
    try:
        response = requests.post(api_url, params={"date": target_date})
        response.raise_for_status()
        result = response.json()
        print(f"✅ ダミーデータを作成しました: {target_date}")
        print(f"   作成されたタスク数: {result.get('count', 0)}")
    except requests.exceptions.ConnectionError:
        print("❌ エラー: バックエンドサーバーに接続できません")
        print("   docker-compose up でバックエンドを起動してください")
        sys.exit(1)
    except requests.exceptions.HTTPError as e:
        print(f"❌ エラー: HTTP {e.response.status_code}")
        print(f"   {e.response.text}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ エラー: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        target_date = sys.argv[1]
        # 日付形式を検証
        try:
            datetime.strptime(target_date, "%Y-%m-%d")
        except ValueError:
            print("❌ エラー: 日付形式が正しくありません (YYYY-MM-DD形式で指定してください)")
            sys.exit(1)
        create_dummy_data(target_date)
    else:
        create_dummy_data()
