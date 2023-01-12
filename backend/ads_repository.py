from typing import List, Optional
import ydb
import os
import uuid
import json
from models import Ad
from dotenv import load_dotenv

_TABLE_NAME = 'series'
_INITIAL_QUERY = '''
CREATE table `{}` (
    `ad_id` String,
    `title` String,
    `text` String,
    `images` Json,
    PRIMARY KEY (`ad_id`)
)
'''.format(_TABLE_NAME)

class AdsRepository:
    def __init__(self, endpoint: str, database: str):
        self._endpoint = endpoint
        self._database = database
        self._driver = ydb.Driver(
            endpoint=endpoint,
            database=database)
        self._pool: Optional[ydb.SessionPool] = None
    
    def _init_db(self, session: ydb.Session):
        session.execute_scheme(_INITIAL_QUERY)
    
    def connect(self):
        self._driver.wait(timeout=5, fail_fast=True)
        self._pool = ydb.SessionPool(self._driver)
        self._pool.retry_operation_sync(self._init_db)

    def close(self):
        self._driver.stop(timeout=5)
    
    def insert_ad(self, title: str, text: str, images: List[str]):
        def callee(session):
            generated_uuid = uuid.uuid4()
            query = '''
                INSERT INTO {} (ad_id, title, text, images)
                VALUES ("{}", "{}", "{}", '{}');
            '''.format(_TABLE_NAME, generated_uuid, title, text, json.dumps(images))
            session.transaction().execute(query, commit_tx=True)
        
        return self._pool.retry_operation_sync(callee)
    
    def get_ads(self) -> List[Ad]:
        def callee(session):
            result: List[Ad] = []
            query = '''
                SELECT ad_id, title, text, images FROM {};
            '''.format(_TABLE_NAME)
            query_result = session.transaction().execute(query)

            for row in query_result[0].rows:
                result.append(Ad(
                    ad_id=row.ad_id.decode(),
                    title=row.title.decode(),
                    text=row.text.decode(),
                    images=json.loads(row.images)
                ))
            
            return result
        
        return self._pool.retry_operation_sync(callee)