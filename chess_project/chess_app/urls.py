from django.urls import path
from . import views

urlpatterns = [
    path('ai-move/', views.AIMoveView.as_view(), name='ai_move'),
    path('chat/', views.ChessGPTView.as_view(), name='chat')
]
