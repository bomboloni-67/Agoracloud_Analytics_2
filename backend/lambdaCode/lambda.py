import os
import boto3
import json
import logging
from concurrent.futures import ThreadPoolExecutor

logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Region where your Topic and Theme are located
quicksight = boto3.client('quicksight', region_name='ap-southeast-1')

def lambda_handler(event, context):
    
    # 1. Retrieve user_id from Authorizer Context
    # authorizer_ctx = event.get('requestContext', {}).get('authorizer', {})
    # user_id = authorizer_ctx.get('user_id')
    authorizer_ctx = event.get('requestContext', {}).get('authorizer', {}).get('claims', {})
    user_id = authorizer_ctx.get('custom:qs_user_id') or authorizer_ctx.get('sub')
    user_email = authorizer_ctx.get('email') 
    
    # 2. Extract Query Params
    query_params = event.get('queryStringParameters') or {}
    embed_type = query_params.get('type')
    the_id = query_params.get('id')

    # Fallback to user_id
    if not user_id:
        user_id = query_params.get('user_id')

    if not user_id or not the_id:
        logger.error(f"Missing required info: user_id={user_id}, id={the_id}")
        return {
            'statusCode': 400, 
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Missing user_id or the_id'})
        }

    account_id = os.environ.get('AWS_ACCOUNT_ID')
    if user_id == "694a0ed0ca44b416413b0eeb" or user_email == "qwer@gmail.com":
        user_arn = f"arn:aws:quicksight:us-east-1:{account_id}:user/default/694a0ed0ca44b416413b0eeb"
    else:
        user_arn = f"arn:aws:quicksight:us-east-1:{account_id}:user/default/{user_email}"
    try:
        experience_configuration = {}
        categories = None

        # --- BRANCH LOGIC BASED ON TYPE ---
        
        if embed_type == 'Dashboards':
            experience_configuration = {
                'Dashboard': {
                    'InitialDashboardId': the_id,
                    'FeatureConfigurations': {
                        'StatePersistence': {
                            'Enabled': True
                        },
                        'Bookmarks': {
                            'Enabled': True
                        },
                        'SharedView': {
                            'Enabled': True
                        },
                        'AmazonQInQuickSight': {
                            'ExecutiveSummary': {
                                'Enabled': True
                            }
                        },
                        'Schedules': {
                            'Enabled': True
                        },
                        'RecentSnapshots': {
                            'Enabled': True
                        },
                        'ThresholdAlerts': {
                            'Enabled': True
                        }
                    }
                }
            }
        elif embed_type == 'Stories':
            experience_configuration = {
                'QuickSightConsole': {
                    'InitialPath': '/start',
                    'FeatureConfigurations': {
                        'StatePersistence': {
                            'Enabled': True|False
                        },
                        'SharedView': {
                            'Enabled': True|False
                        },
                        'AmazonQInQuickSight': {
                            'DataStories': { 'Enabled': True },
                            'ExecutiveSummary': { 'Enabled': True },
                            'GenerativeAuthoring': { 'Enabled': True },
                            'DataQnA': { 'Enabled': True }
                        }
                    }
                }
            }
        else:
            # Generative Q&A Experience
            experience_configuration = {
                'GenerativeQnA': {
                    'InitialTopicId': the_id 
                }
            }
            
            # Fetch Reviewed Questions (Keep original logic)
            try:
                reviewed_questions = quicksight.list_topic_reviewed_answers(
                    AwsAccountId=account_id,
                    TopicId=the_id
                )
                raw_questions = reviewed_questions.get('Answers', [])
                categories = [a['Question'] for a in raw_questions if 'Question' in a]
            except Exception as q_err:
                logger.error(f"Failed to fetch suggestions: {str(q_err)}")
                categories = []

        # --- Topic and Dashboard based on User  ---
        def fetch_assets():
            with ThreadPoolExecutor() as executor:
                # Search Dashboards user has access to
                db_future = executor.submit(
                    quicksight.search_dashboards,
                    AwsAccountId=account_id,
                    Filters=[{'Operator': 'StringEquals', 'Name': 'QUICKSIGHT_USER', 'Value': user_arn}]
                )
                # Search Topics user has access to
                topic_future = executor.submit(
                    quicksight.search_topics,
                    AwsAccountId=account_id,
                    Filters=[{'Operator': 'StringEquals', 'Name': 'QUICKSIGHT_USER', 'Value': user_arn}]
                )
                return db_future.result(), topic_future.result()

        try:
            db_res, topic_res = fetch_assets()
            available_dashboards = [
                {'id': d['DashboardId'], 'name': d['Name']} 
                for d in db_res.get('DashboardSummaryList', [])
            ]
            available_topics = [
                {'id': t['TopicId'], 'name': t['Name']} 
                for t in topic_res.get('TopicSummaryList', [])
            ]
        except Exception as discovery_err:
            logger.error(f"Discovery failed: {str(discovery_err)}")
            available_dashboards = []
            available_topics = []

        # 3. Generate Embed URL
        embed_url = None
        if the_id and the_id != "default":
            response = quicksight.generate_embed_url_for_registered_user(
                AwsAccountId=account_id,
                UserArn=user_arn,
                SessionLifetimeInMinutes=600,
                ExperienceConfiguration=experience_configuration,
                AllowedDomains=['http://localhost:5173', 'http://localhost:3000','https://bomboloni-67.github.io'] 
            )
            embed_url = response['EmbedUrl']

        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*', 
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,OPTIONS',
                'Content-Type': 'application/json'
            },
            'body': json.dumps({
                'embed_url': embed_url,
                'suggestions': categories,
                'type_rendered': embed_type,
                'available_dashboards': available_dashboards, 
                'available_topics': available_topics          
            })
        }

    except Exception as e:
        logger.error(f"QuickSight Error: {str(e)}")
        return {
            'statusCode': 500, 
            'headers': {'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }